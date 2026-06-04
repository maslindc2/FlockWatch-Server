import { OutbreakTimelineService } from "../../../src/modules/outbreak-timeline/outbreak-timeline.service";
import { SiteDetailsModel } from "../../../src/modules/site-details/site-details.model";
import { logger } from "../../../src/utils/winston-logger";

// ---- Helpers ----------------------------------------------------------------

const mockAggregate = (resolvedValue: any[]) => {
    const execMock = jest.fn().mockResolvedValue(resolvedValue);
    jest.spyOn(SiteDetailsModel.getModel, "aggregate").mockReturnValue({
        exec: execMock,
    } as any);
    return execMock;
};

// ---- Tests ------------------------------------------------------------------

describe("OutbreakTimelineService", () => {
    let service: OutbreakTimelineService;

    beforeEach(() => {
        service = new OutbreakTimelineService();
        jest.spyOn(logger, "error").mockImplementation(() => logger);
    });

    afterEach(() => jest.restoreAllMocks());

    describe("getTimeline", () => {
        it("should return periods grouped by month by default", async () => {
            const aggResult = [
                { _id: null, period: "2024-11", new_confirmations: 12, birds_affected: 340000 },
                { _id: null, period: "2024-12", new_confirmations: 31, birds_affected: 4800000 },
            ];
            mockAggregate(aggResult);

            const result = await service.getTimeline("month");

            expect(result.granularity).toBe("month");
            expect(result.periods).toHaveLength(2);
            expect(result.periods[0].period).toBe("2024-11");
            expect(result.periods[0].new_confirmations).toBe(12);
            expect(result.periods[0].birds_affected).toBe(340000);
        });

        it("should compute cumulative_birds_affected as a running total", async () => {
            const aggResult = [
                { _id: null, period: "2024-11", new_confirmations: 5, birds_affected: 100 },
                { _id: null, period: "2024-12", new_confirmations: 10, birds_affected: 200 },
                { _id: null, period: "2025-01", new_confirmations: 3, birds_affected: 50 },
            ];
            mockAggregate(aggResult);

            const result = await service.getTimeline("month");

            expect(result.periods[0].cumulative_birds_affected).toBe(100);
            expect(result.periods[1].cumulative_birds_affected).toBe(300);
            expect(result.periods[2].cumulative_birds_affected).toBe(350);
        });

        it("should include $sort stage to sort periods chronologically", async () => {
            mockAggregate([]);

            await service.getTimeline("month");

            const pipeline = (
                SiteDetailsModel.getModel.aggregate as jest.Mock
            ).mock.calls[0][0];
            expect(pipeline[2].$sort).toEqual({ period: 1 });
        });

        it("should preserve the sort order from the aggregation result", async () => {
            const aggResult = [
                { _id: null, period: "2024-11", new_confirmations: 5, birds_affected: 100 },
                { _id: null, period: "2024-12", new_confirmations: 10, birds_affected: 200 },
                { _id: null, period: "2025-01", new_confirmations: 3, birds_affected: 50 },
            ];
            mockAggregate(aggResult);

            const result = await service.getTimeline("month");

            expect(result.periods.map((p) => p.period)).toEqual([
                "2024-11",
                "2024-12",
                "2025-01",
            ]);
        });

        it("should return empty periods array when no site data exists", async () => {
            mockAggregate([]);

            const result = await service.getTimeline("month");

            expect(result.periods).toEqual([]);
        });

        it("should handle a single period correctly", async () => {
            const aggResult = [
                { _id: null, period: "2024-11", new_confirmations: 5, birds_affected: 100 },
            ];
            mockAggregate(aggResult);

            const result = await service.getTimeline("month");

            expect(result.periods).toHaveLength(1);
            expect(result.periods[0].cumulative_birds_affected).toBe(100);
        });

        it("should use week granularity format", async () => {
            mockAggregate([]);

            await service.getTimeline("week");

            const pipeline = (
                SiteDetailsModel.getModel.aggregate as jest.Mock
            ).mock.calls[0][0];
            const format =
                pipeline[0].$group._id.$dateToString.format;
            expect(format).toBe("%G-W%V");
        });

        it("should use month granularity format", async () => {
            mockAggregate([]);

            await service.getTimeline("month");

            const pipeline = (
                SiteDetailsModel.getModel.aggregate as jest.Mock
            ).mock.calls[0][0];
            const format =
                pipeline[0].$group._id.$dateToString.format;
            expect(format).toBe("%Y-%m");
        });

        it("should use year granularity format", async () => {
            mockAggregate([]);

            await service.getTimeline("year");

            const pipeline = (
                SiteDetailsModel.getModel.aggregate as jest.Mock
            ).mock.calls[0][0];
            const format =
                pipeline[0].$group._id.$dateToString.format;
            expect(format).toBe("%Y");
        });

        it("should throw an error for invalid granularity", async () => {
            await expect(
                service.getTimeline("quarter")
            ).rejects.toThrow(
                'Invalid granularity "quarter". Valid values: week, month, year'
            );
        });

        it("should log and re-throw on aggregation failure", async () => {
            const errorSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);
            const execMock = jest
                .fn()
                .mockRejectedValue(new Error("Pipeline failed"));
            jest.spyOn(SiteDetailsModel.getModel, "aggregate").mockReturnValue({
                exec: execMock,
            } as any);

            await expect(service.getTimeline("month")).rejects.toThrow(
                "Failed to compute outbreak timeline"
            );
            expect(errorSpy).toHaveBeenCalled();
        });

        it("should include $group, $project, and $sort stages in the pipeline", async () => {
            mockAggregate([]);

            await service.getTimeline("month");

            const pipeline = (
                SiteDetailsModel.getModel.aggregate as jest.Mock
            ).mock.calls[0][0];
            expect(pipeline[0].$group).toBeDefined();
            expect(pipeline[1].$project).toBeDefined();
            expect(pipeline[2].$sort).toBeDefined();
        });

        it("should sum birds_affected in the $group stage", async () => {
            mockAggregate([]);

            await service.getTimeline("month");

            const pipeline = (
                SiteDetailsModel.getModel.aggregate as jest.Mock
            ).mock.calls[0][0];
            expect(pipeline[0].$group.birds_affected.$sum).toBe(
                "$birds_affected"
            );
        });

        it("should count documents in the $group stage", async () => {
            mockAggregate([]);

            await service.getTimeline("month");

            const pipeline = (
                SiteDetailsModel.getModel.aggregate as jest.Mock
            ).mock.calls[0][0];
            expect(pipeline[0].$group.new_confirmations.$sum).toBe(1);
        });
    });
});
