export class Debug {
    private dom : HTMLElement | null
    constructor() {
        this.dom = document.getElementById('debug');
    }
    log(m:Object){
        if (!this.dom) return
            this.dom.innerText = JSON.stringify(m)
    }
}