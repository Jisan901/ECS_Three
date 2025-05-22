
export class WinPad {
    keyDown: boolean = false;
    pointerDown: boolean = false;
    left: boolean = false;
    right: boolean = false;
    bottom: boolean = false;

    buttons: Record<string, { name: string; dom: HTMLElement }> = {};
    phi: number = 0;
    theta: number = 0;
    hudData: { deltaX: number; deltaY: number; middle: number } = { deltaX: 0, deltaY: 0, middle: 0 };

    dom: HTMLElement;
    parent: HTMLElement;

    constructor(dom: HTMLElement, parent: HTMLElement) {
        this.dom = dom;
        this.parent = parent;
        this.setupBothPad();
        this.addButtons();
    }

    setup(): void {}

    setupBothPad(): void {}

    addButtons(): void {}

    addButton(button: { name: string; dom: HTMLElement }): void {
        this.buttons[button.name] = button;
        this.dom.appendChild(button.dom);
    }
}



type HUDData = {
    deltaX: number;
    deltaY: number;
    middle: number;
};



export class LightGamePad {
    keyDown = false;
    pointerDown = false;
    forward = false;
    right = false;
    left = false;
    backward = false;

    buttons: Record<string, Button | WASDKey> = {};
    phi = 0;
    theta = 0;
    hudData: HUDData = { deltaX: 0, deltaY: 0, middle: 0 };

    dom: HTMLElement;
    movementpad?: MovementPad;
    wasd?: WASD;
    rotationPad!: CustomPad;

    constructor(dom: HTMLElement) {
        this.dom = dom;

        this.setupBothPad();

        if (window.matchMedia('(pointer: coarse)').matches) {
            this.addButtons();
        } else {
            this.addKeys();
        }
    }

    setup(): void {
        this.movementpad?.alignAndConfigPad();   
        this.movementpad?.resetHandlePosition();   
    }

    setupBothPad(): void {
        const isTouch = window.matchMedia('(pointer: coarse)').matches;

        if (isTouch) {
            this.movementpad = new MovementPad(this.dom);
            this.movementpad.setState = (event: { detail: HUDData }) => {
                if (this.movementpad!.mouseDown) {
                    this.keyDown = true;
                    this.hudData = event.detail;

                    this.forward = event.detail.deltaY > event.detail.middle;
                    this.backward = event.detail.deltaY < event.detail.middle;

                    this.left = event.detail.deltaX > event.detail.middle;
                    this.right = event.detail.deltaX < event.detail.middle;
                } else {
                    this.keyDown = false;
                    this.hudData = { deltaX: 0, deltaY: 0, middle: 0 };
                    this.left = this.right = this.forward = this.backward = false;
                }
            };
        } else {
            this.wasd = new WASD();
            this.wasd.setState = () => {
                this.keyDown = this.wasd!.keyDown;
                this.forward = this.wasd!.keys.w;
                this.backward = this.wasd!.keys.s;
                this.left = this.wasd!.keys.a;
                this.right = this.wasd!.keys.d;
                this.hudData = {
                    deltaX: this.wasd!.deltaX,
                    deltaY: this.wasd!.deltaY,
                    middle: 0,
                };
            };
        }

        this.rotationPad = new CustomPad(this.dom);
        this.rotationPad.setState = () => {
            this.phi = this.rotationPad.phi;
            this.theta = this.rotationPad.theta;
            this.pointerDown = this.rotationPad.isTouching;
        };
    }

    addButtons(): void {
        this.addButton(new Button('actionPressed', { x: 80, y: 100 }, { x: 'right', y: 'bottom' }, 80));
        this.addButton(new Button('spacePressed', { x: 10, y: 200 }, { x: 'right', y: 'bottom' }));
        this.addButton(new Button('autoSwitch', { x: 30, y: 240 }));
    }

    addKeys(): void {
        this.addKey(new WASDKey('actionPressed'), 79);
        this.addKey(new WASDKey('spacePressed'), 32);
        this.addKey(new WASDKey('autoSwitch'), 82);
    }

    addButton(button: Button): void {
        this.buttons[button.name] = button;
        this.dom.appendChild(button.dom);
    }

    addKey(key: WASDKey, keyCode: number): void {
        this.buttons[key.name] = key;
        this.wasd!.keyStore[keyCode] = key;
    }
}


export class WASDKey {
    name: string;
    pressed: boolean;
    switch: boolean;

    constructor(name: string) {
        this.name = name;
        this.pressed = false;
        this.switch = false;
    }

    down(): void {
        this.onClick();
        this.pressed = true;
        this.switch = !this.switch;
    }

    up(): void {
        this.onClickEnd();
        this.pressed = false;
    }

    onClick(): void {
        // Override if needed
    }

    onClickEnd(): void {
        // Override if needed
    }
}

type Position = {
    x: number;
    y: number;
};

type Side = {
    x: 'left' | 'right';
    y: 'top' | 'bottom';
};

export class Button {
    name: string;
    pressed: boolean;
    switch: boolean;
    image: string;
    dom: HTMLButtonElement;
    position: Position;

    constructor(
        name: string,
        position: Position = { x: 0, y: 0 },
        side: Side = { x: 'left', y: 'bottom' },
        size: number = 50,
        image: string = ''
    ) {
        this.name = name;
        this.pressed = false;
        this.switch = false;
        this.image = image;
        this.dom = document.createElement('button');
        this.position = position;

        this.dom.setAttribute(
            'style',
            `
            position: fixed;
            ${side.x}: ${position.x}px;
            ${side.y}: ${position.y}px;
            border: 2px solid rgba(218, 225, 230, 0.25);
            height: ${size}px;
            width: ${size}px;
            border-radius: 50%;
            background: radial-gradient(
                rgba(218, 225, 230, 0.25) 5%,
                rgba(218, 225, 230, 0.5) 95%
            ), url(${image});
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
            user-select: none;
            z-index: 10;
        `
        );

        this.dom.addEventListener('touchstart', (e: TouchEvent) => {
            e.stopPropagation();
            this.onClick();
            this.pressed = true;
            this.switch = !this.switch;
        });

        this.dom.addEventListener('touchmove', (e: TouchEvent) => {
            e.stopPropagation();
        });

        this.dom.addEventListener('touchend', (e: TouchEvent) => {
            e.stopPropagation();
            this.onClickEnd();
            this.pressed = false;
        });
    }

    onClick(): void {
        // Override this method when needed
    }

    onClickEnd(): void {
        // Override this method when needed
    }
}


/**
 * Represents a movement pad user interface element.
 * @class
 * @copyright (c) 2021 Mehdi Seifi
 * @description
 * i found it on github 
 * it is a three js touch control example
 */
function getOffset(el: HTMLElement): { top: number; left: number } {
    const rect = el.getBoundingClientRect();
    return {
        top: rect.top + document.documentElement.scrollTop,
        left: rect.left + document.documentElement.scrollLeft
    };
}


type RegionData = {
    width: number;
    height: number;
    radius: number;
    position: { top: number; left: number };
    offset: { top: number; left: number };
    centerX: number;
    centerY: number;
};

type HandleData = {
    width: number;
    height: number;
    radius: number;
};

export class MovementPad {
    container: HTMLElement;
    padElement: HTMLDivElement;
    region: HTMLDivElement;
    handle: HTMLDivElement;
    eventRepeatTimeout: number | undefined;
    regionData: RegionData = {} as RegionData;
    handleData: HandleData = {} as HandleData;
    mouseDown = false;
    mouseStopped = false;

    constructor(container: HTMLElement) {
        this.container = container;

        this.padElement = document.createElement('div');
        this.padElement.classList.add('movement-pad');

        this.region = document.createElement('div');
        this.region.classList.add('region');

        this.handle = document.createElement('div');
        this.handle.classList.add('handle');

        this.region.appendChild(this.handle);
        this.padElement.appendChild(this.region);
        this.container.appendChild(this.padElement);

        this.alignAndConfigPad();

        window.addEventListener('resize', () => {
            this.alignAndConfigPad();
            this.resetHandlePosition()
        });

        this.region.addEventListener('touchstart', (event: TouchEvent) => {
            event.stopPropagation();
            this.mouseDown = true;
            this.handle.style.opacity = '1.0';

            this.update(event.targetTouches[0].pageX, event.targetTouches[0].pageY);
        });

        const touchEnd = () => {
            this.mouseDown = false;
            this.setState();
            this.resetHandlePosition();
        };

        this.region.addEventListener('touchend', touchEnd);
        this.region.addEventListener('touchcancel', touchEnd);

        this.region.addEventListener('touchmove', (event: TouchEvent) => {
            event.stopPropagation();
            if (!this.mouseDown) return;

            this.update(event.targetTouches[0].pageX, event.targetTouches[0].pageY);
        });

        this.resetHandlePosition();
    }

    alignAndConfigPad(): void {
        this.regionData.width = this.region.offsetWidth;
        this.regionData.height = this.region.offsetHeight;
        this.regionData.position = {
            top: this.region.offsetTop,
            left: this.region.offsetLeft
        };
        this.regionData.offset = getOffset(this.region);
        this.regionData.radius = this.regionData.width / 2;
        this.regionData.centerX = this.regionData.position.left + this.regionData.radius;
        this.regionData.centerY = this.regionData.position.top + this.regionData.radius;

        this.handleData.width = this.handle.offsetWidth;
        this.handleData.height = this.handle.offsetHeight;
        this.handleData.radius = this.handleData.width / 2;

        this.regionData.radius = this.regionData.width / 2 - this.handleData.radius;
    }

    update(pageX: number, pageY: number): void {
        let newLeft = pageX - this.regionData.offset.left;
        let newTop = pageY - this.regionData.offset.top;

        let distance = Math.pow(this.regionData.centerX - newLeft, 2) +
                       Math.pow(this.regionData.centerY - newTop, 2);

        if (distance > Math.pow(this.regionData.radius, 2)) {
            const angle = Math.atan2(newTop - this.regionData.centerY, newLeft - this.regionData.centerX);
            newLeft = Math.cos(angle) * this.regionData.radius + this.regionData.centerX;
            newTop = Math.sin(angle) * this.regionData.radius + this.regionData.centerY;
        }

        newTop = Math.round(newTop * 10) / 10;
        newLeft = Math.round(newLeft * 10) / 10;

        this.handle.style.top = `${newTop - this.handleData.radius}px`;
        this.handle.style.left = `${newLeft - this.handleData.radius}px`;

        let deltaX = this.regionData.centerX - newLeft;
        let deltaY = this.regionData.centerY - newTop;

        deltaX = -2 + 4 * (deltaX - -this.regionData.radius) / (2 * this.regionData.radius);
        deltaY = -2 + 4 * (deltaY - -this.regionData.radius) / (2 * this.regionData.radius);

        deltaX = Math.round(deltaX * 10) / 10;
        deltaY = Math.round(deltaY * 10) / 10;

        deltaX /= 2;
        deltaY /= 2;

        this.setState({ detail: { deltaX, deltaY, middle: 0 } });
    }

    setState(_det?: { detail: { deltaX: number; deltaY: number; middle: number } }): void {
        // Override as needed
    }

    resetHandlePosition(): void {
        this.handle.style.top = `${this.regionData.centerY - this.handleData.radius}px`;
        this.handle.style.left = `${this.regionData.centerX - this.handleData.radius}px`;
        this.handle.style.opacity = '0.1';
    }
}


export class CustomPad {
    domElement: HTMLElement;
    phi: number = 0;
    theta: number = 0;

    isTouching: boolean = false;
    touchStart: { x: number; y: number } = { x: 0, y: 0 };
    touchCurrent: { x: number; y: number } = { x: 0, y: 0 };

    rotationSpeed: number = 0.01;
    dampingFactor: number = 0.25;

    constructor(domElement: HTMLElement) {
        this.domElement = domElement;

        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

        if (!isTouchDevice) {
            this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
            this.domElement.addEventListener('click', () => {
                this.domElement.requestPointerLock();
                this.isTouching = true;
            });
        } else {
            this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
            this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), false);
            this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
        }
    }

    onTouchStart(event: TouchEvent): void {
        event.stopPropagation();
        if (event.targetTouches.length === 1) {
            this.isTouching = true;
            this.touchStart.x = event.targetTouches[0].pageX;
            this.touchStart.y = event.targetTouches[0].pageY;
        }
    }

    onTouchMove(event: TouchEvent): void {
        event.stopPropagation();
        if (this.isTouching && event.targetTouches.length === 1) {
            this.touchCurrent.x = event.targetTouches[0].pageX;
            this.touchCurrent.y = event.targetTouches[0].pageY;

            const deltaX = (this.touchCurrent.x - this.touchStart.x) * this.rotationSpeed;
            const deltaY = (this.touchCurrent.y - this.touchStart.y) * this.rotationSpeed;

            this.setPhiTheta(deltaX, deltaY);

            this.touchStart.x = this.touchCurrent.x;
            this.touchStart.y = this.touchCurrent.y;
        }
    }

    onTouchEnd(event: TouchEvent): void {
        event.stopPropagation();
        this.isTouching = false;
        this.setState();
    }

    onMouseMove(event: MouseEvent): void {
        this.isTouching = true;
        event.stopPropagation();

        if (document.pointerLockElement) {
            const deltaX = event.movementX * this.rotationSpeed;
            const deltaY = event.movementY * this.rotationSpeed;

            this.setPhiTheta(deltaX, deltaY);
        }
    }

    setPhiTheta(deltaX: number, deltaY: number): void {
        this.phi -= deltaX;
        this.theta -= deltaY;
        this.theta = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.theta));
        this.setState();
    }

    setState(): void {
        // Meant to be overridden
    }
}


type KeyMap = {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
};

type KeyHandler = {
    down: () => void;
    up: () => void;
};

export class WASD {
    keys: KeyMap;
    keyStore: { [keyCode: number]: KeyHandler };
    deltaX: number;
    deltaY: number;
    keyDown: boolean;

    constructor() {
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
        };
        this.keyStore = {};
        this.deltaX = 0;
        this.deltaY = 0;
        this.keyDown = false;

        const handleKeyDown = (event: KeyboardEvent) => {
            this.keyDown = true;
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.keys.w = true;
                    this.deltaY = 1;
                    break;
                case 'a':
                    this.keys.a = true;
                    this.deltaX = 1;
                    break;
                case 's':
                    this.keys.s = true;
                    this.deltaY = -1;
                    break;
                case 'd':
                    this.keys.d = true;
                    this.deltaX = -1;
                    break;
                default:
                    this.keyStore[event.keyCode]?.down?.();
            }
            this.setState();
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            this.keyDown = false;
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.keys.w = false;
                    this.deltaY = 0;
                    break;
                case 'a':
                    this.keys.a = false;
                    this.deltaX = 0;
                    break;
                case 's':
                    this.keys.s = false;
                    this.deltaY = 0;
                    break;
                case 'd':
                    this.keys.d = false;
                    this.deltaX = 0;
                    break;
                default:
                    this.keyStore[event.keyCode]?.up?.();
            }
            this.setState();
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }

    setState(): void {
        // Implement your logic
    }
}
