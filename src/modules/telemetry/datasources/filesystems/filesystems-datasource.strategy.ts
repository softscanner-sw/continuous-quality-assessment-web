import * as fs from 'fs';
import path from 'path';
import { Assessment } from '../../../../core/assessment/assessment-core';
import { TelemetryDataSource, TelemetryDataSourceConfig } from '../../../../core/telemetry/telemetry';

export class FileTelemetryDataSource extends TelemetryDataSource {
    private filePath: string;

    constructor(config: TelemetryDataSourceConfig) {
        super(config);
        this.filePath = this.config.storageEndpoint.uri;
    }

    async connect(): Promise<void> {
        // No specific connection needed for file-based storage
    }

    async disconnect(): Promise<void> {
        // No specific disconnection needed for file-based storage
    }

    async read(): Promise<{ telemetryData: any[], assessments: any[] }> {
        if (!fs.existsSync(this.filePath)) {
            console.warn(`File Telemetry DataSource: File ${this.filePath} does not exist.`);
            return { telemetryData: [], assessments: [] };
        }

        let parsedData = { telemetryData: [] as any[], assessments: [] as any[] };

        try {
            const fileStream = fs.createReadStream(this.filePath, { encoding: 'utf-8' });
            let fileContent = '';

            for await (const chunk of fileStream)
                fileContent += chunk;

            switch (this.config.dataFormat) {
                case 'CSV':
                    parsedData = this.parseCSV(fileContent);
                    break;
                case 'XML':
                    parsedData = this.parseXML(fileContent);
                    break;
                case 'JSON':
                default:
                    parsedData = JSON.parse(fileContent);
            }

            // Validate required attributes
            if (!parsedData.telemetryData[0].attributes || !parsedData.telemetryData[0].attributes["event_type"])
                console.warn("File Telemetry DataSource: Invalid telemetry data:", parsedData);

        } catch (error) {
            console.error(`FileTelemetryDataSource: Failed to read file at ${this.filePath}.`, error);
        }

        return parsedData;
    }

    async store(data: any): Promise<void> {
        const fileData = await this.read();

        // Ensure the exportation destination path exists
        if (!fs.existsSync(path.dirname(this.filePath)))
            fs.mkdirSync(path.dirname(this.filePath), { recursive: true });

        // Add new telemetry data
        fileData.telemetryData.push(data);

        // Store new data
        await this.writeFile(fileData);
    }

    async storeAll(data: any[]): Promise<void> {
        let fileData = await this.read();

        // Ensure the exportation destination path exists
        if (!fs.existsSync(path.dirname(this.filePath)))
            fs.mkdirSync(path.dirname(this.filePath), { recursive: true });

        // Add new telemetry data
        fileData.telemetryData.push(...data);

        // Write back to the file
        await this.writeFile(fileData);
    }

    async storeAssessments(assessments: Assessment[], filter?: any): Promise<void> {
        let fileData = await this.read();

        // Add new assessments
        fileData.assessments.push(...assessments.map(assessment => ({
            goal: {
                name: assessment.goal.name,
                description: assessment.goal.description,
                weight: assessment.goal.weight,
                metrics: assessment.goal.metrics.map(metric => ({
                    name: metric.name,
                    acronym: metric.acronym,
                    description: metric.description,
                    unit: metric.unit
                })),
            },
            globalScore: assessment.globalScore,
            timestamp: assessment.timestamp,
            details: assessment.assessments
        })));

        // Write back to the file
        await this.writeFile(fileData);
    }

    private async writeFile(data: any): Promise<void> {
        const fileData = this.formatData(data);

        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(this.filePath, { encoding: 'utf-8' });

            writeStream.write(fileData, 'utf-8');

            writeStream.on('finish', () => {
                console.log(`File Telemetry DataSource: Data written to ${this.filePath}`);
                resolve();
            });

            writeStream.on('error', (err) => {
                console.error(`File Telemetry DataSource: Error writing data to ${this.filePath}`, err);
                reject(err);
            });

            writeStream.end();
        });
    }

    private parseCSV(fileContent: string): any {
        // Implement CSV parsing logic
    }

    private parseXML(fileContent: string): any {
        // Implement XML parsing logic
    }

    private formatData(data: any): string {
        switch (this.config.dataFormat) {
            case 'CSV':
                return this.toCSV(data);
            case 'XML':
                return this.toXML(data);
            case 'JSON':
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    private toCSV(data: any): string {
        // Implement CSV formatting logic
        return '';
    }

    private toXML(data: any): string {
        // Implement XML formatting logic
        return '';
    }
}