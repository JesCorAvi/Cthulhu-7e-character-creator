declare module '@3d-dice/dice-box' {
  export default class DiceBox {
    constructor(options: any);
    init(): Promise<void>;
    roll(notation: string | string[]): Promise<any[]>;
    clear(): void;
    resizeWorld(): void;
    updateConfig(config: any): void;
    // Puedes añadir más métodos si los necesitas, 
    // pero con esto basta para que el error desaparezca.
  }
}