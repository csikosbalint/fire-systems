export class Validator {
    static hasEnoughData(data: unknown[], lookback: number): boolean {
        return data.length >= lookback
    }
}

