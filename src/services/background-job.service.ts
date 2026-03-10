type JobHandler<T> = (payload: T) => Promise<void> | void;

type Job<T> = {
    name: string;
    payload: T;
};

export class BackgroundJobService {
    private handlers: Record<string, JobHandler<any>> = {};

    register<T>(name: string, handler: JobHandler<T>) {
        this.handlers[name] = handler;
    }

    async enqueue<T>(name: string, payload: T) {
        const handler = this.handlers[name];
        if (!handler) {
            throw new Error(`No handler registered for job ${name}`);
        }

        const job: Job<T> = { name, payload };
        setImmediate(async () => {
            try {
                await handler(job.payload);
            } catch (error) {
                console.error(`Job ${job.name} failed:`, error);
            }
        });
    }
}
