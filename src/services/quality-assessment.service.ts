import { Assessment, AssessmentEngine } from "../core/assessment/assessment-core";
import { Goal } from "../core/goals/goals";
import { Metric } from "../core/metrics/metrics-core";
import { TelemetryCollector } from "../core/telemetry/telemetry";
import { MetricsService } from "./metrics.service";
import { IProgressTrackable, ProgressTracker } from "./progress-tracker.service";

/**
 * Service to handle telemetry collection and storage and metric computation for quality assessment.
 */
export class QualityAssessmentService implements IProgressTrackable {
    private assessmentEngine: AssessmentEngine = new AssessmentEngine();
    private assessmentUpdateListeners: ((goals: Goal[]) => void)[] = [];
    private metricsService: MetricsService = new MetricsService();
    private collector?: TelemetryCollector;
    private selectedGoals: Goal[] = [];
    private progressTracker!: ProgressTracker;


    constructor() {
        // Register handler for when new metrics are computed
        this.metricsService.onMetricsUpdated(this.handleNewMetrics.bind(this));
    }

    setProgressTracker(progressTracker: ProgressTracker): void {
        this.progressTracker = progressTracker;
        this.metricsService.setProgressTracker(progressTracker);
    }

    /**
     * Set context (collector and selected goals), allowing dynamic configuration.
     */
    setContext(collector: TelemetryCollector, goals: Goal[]) {
        this.collector = collector;
        this.selectedGoals = goals;
    }

    /**
     * Handles newly computed metrics and updates assessments.
     */
    private async handleNewMetrics(metrics: Metric[]) {
        if (!this.progressTracker) {
            throw new Error('Progress tracker not set in QualityAssessmentService.');
        }

        if (!this.selectedGoals || this.selectedGoals.length === 0) {
            console.warn('QualityAssessmentService: No goals set for assessment.');
            return;
        }

        this.progressTracker.notifyProgress('Quality Assessment Service: Computing new assessments...');

        // Perform assessment based on new metrics and selected goals
        const assessments = this.assessmentEngine.assessGoals(this.selectedGoals, metrics);

        // Attach assessments to goals
        this.selectedGoals.forEach(goal => {
            const assessment = assessments.find(a => a.goal.name === goal.name);
            if (assessment) {
                goal.addAssessment(assessment);  // Attach assessment to the goal
            }
        });

        // Notify listeners about the updated goals
        this.notifyAssessmentUpdated(assessments.map(a => a.goal));
    }

    /**
     * Initiates the assessment process by computing metrics and assessing quality goals.
     */
    async assessQualityGoals(): Promise<Goal[]> {
        if (!this.progressTracker) {
            throw new Error('Progress tracker not set in QualityAssessmentService.');
        }

        if (!this.collector || this.selectedGoals.length === 0) {
            throw new Error("QualityAssessmentService: Collector or goals not set.");
        }

        this.progressTracker.notifyProgress('Quality Assessment Service: Starting quality goal assessment...');

        // Extract metrics from selected goals
        const selectedMetrics = this.selectedGoals.flatMap(goal => goal.metrics);

        // Compute metrics using the metrics service
        const computedMetrics = await this.metricsService.computeMetrics(this.collector, selectedMetrics);

        // Perform assessment based on the computed metrics
        const assessments = this.assessmentEngine.assessGoals(this.selectedGoals, computedMetrics);

        // Attach assessments to goals
        this.selectedGoals.forEach(goal => {
            const assessment = assessments.find(a => a.goal.name === goal.name);
            if (assessment) {
                goal.addAssessment(assessment);  // Attach assessment to the goal
            }
        });

        // Notify listeners about the updated goals
        this.notifyAssessmentUpdated(this.selectedGoals);
        this.progressTracker.notifyProgress('Quality Assessment Service: Quality goal assessment completed.');
        return this.selectedGoals;
    }

    /**
     * Registers an event listener to notify when new assessments are available.
     */
    onAssessmentUpdated(listener: (goals: Goal[]) => void): void {
        this.assessmentUpdateListeners.push(listener);
    }

    /**
     * Notifies all listeners about new goal assessments.
     */
    private notifyAssessmentUpdated(goals: Goal[]): void {
        console.log('Quality Assessment Service: New assessments available, notifying listeners...');
        this.assessmentUpdateListeners.forEach(listener => listener(goals));
    }
}