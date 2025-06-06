export class ThradePool {
    private maxThrade: number;
    private availableThrade: number;
    private ppidStartFrom = 1000;
    private pool: Record<string, Thrade>;

    constructor(maxThrade: number) {
        this.maxThrade = maxThrade;
        this.pool = {};
        this.availableThrade = maxThrade;
    }

    add(thrade: Thrade): boolean {
        if (this.availableThrade <= 0) return false;
        const pid = thrade.pid + this.ppidStartFrom;

        if (this.pool[pid]) return false;

        this.pool[pid] = thrade;
        thrade.__initiate_worker();
        this.availableThrade--;
        return true;
    }

    start(): void {
        for (const key in this.pool) {
            this.pool[key].start();
        }
    }

    update(time: number): void {
        for (const key in this.pool) {
            this.pool[key].update(time);
        }
    }
}

export class Thrade {
    public pid: number;
    public free: boolean = true;
    public file: string;
    public updateQueue: any[] = [];
    public worker: Worker | null = null;
    public data: any = undefined;

    private root: ThradePool | null;

    constructor(pid: number, file: string, pool: ThradePool | null = (window as any).thradePool ?? null) {
        this.pid = pid;
        this.file = file;
        this.root = pool;

        this.root?.add(this);
    }

    __initiate_worker(): void {
        this.worker = new Worker(this.file, { type: "module" });

        this.worker.onmessage = (e) => this.onresult(e);
        this.worker.onerror = (e) => {
            console.error(`${e.type} at PID ${this.pid}`, e.message, e);
        };
    }

    start(): void {
        
        this.worker?.postMessage({ type: "boot", data: this.data });
    }

    update(time: number): void {
        this.worker?.postMessage({ type: "update", time, data: this.data });
    }

    query(data: any): void {
        this.worker?.postMessage({ type: "query", data });
    }

    private onresult(e: MessageEvent): void {
        const result = e.data;
        if (!result) return;

        if (result.type === 'debugInternal') {
            console.log(`worker log ${this.pid}`, result);
        } else {
            this.updateQueue.push(result);
        }
    }
}

// Just for use inside Web Worker
export function debug(...log: any[]): void {
    (postMessage as any)({ type: 'debugInternal', log });
}
