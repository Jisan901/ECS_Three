// main.ts (or index.ts)
import __globalEvent from './global-events';
import UI from './UserInterface';
import Application from './Application';
import Game from './Game';

// You may want to type these classes if you have definitions
const ui = new UI(__globalEvent);
const controller = new Game(__globalEvent);
const application = new Application(ui, controller, __globalEvent);

window.addEventListener("load", () => {
    // Assuming `eruda` has been loaded globally
    // Declare it to avoid TypeScript errors
    (window as any).eruda?.init();
    application.init();
});
