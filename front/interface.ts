import {PenguinParty} from "./penguin-party-sdk";
import * as PIXI from "pixi.js";

export class Interface {
    sdk: PenguinParty
    public constructor(app: PIXI.Application, sdk: PenguinParty) {
        this.sdk = sdk
    }
}