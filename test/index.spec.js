"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = require("../src");
const armaments_json_1 = __importDefault(require("../test-data/armaments.json"));
const correction_attack_json_1 = __importDefault(require("../test-data/correction-attack.json"));
const correction_graph_json_1 = __importDefault(require("../test-data/correction-graph.json"));
const reinforcements_json_1 = __importDefault(require("../test-data/reinforcements.json"));
describe('AR calculation', () => {
    it('Standard Dagger +0 10/10/10/10/10 -> 82', () => {
        const calculator = new src_1.ArmamentCalculator('Dagger', 'Standard', 0);
        calculator.importData({
            armaments: armaments_json_1.default,
            correction_attack: correction_attack_json_1.default,
            correction_graph: correction_graph_json_1.default,
            reinforcements: reinforcements_json_1.default
        });
        const ar = calculator.attackPower({
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            faith: 10,
            arcane: 10,
        });
        (0, chai_1.expect)(ar.total).to.equal(82);
    });
    it('Commander\'s Standard +7 33/21/34/54/23 -> 424', () => {
        const calculator = new src_1.ArmamentCalculator('Commander\'s Standard', 'Standard', 7);
        calculator.importData({
            armaments: armaments_json_1.default,
            correction_attack: correction_attack_json_1.default,
            correction_graph: correction_graph_json_1.default,
            reinforcements: reinforcements_json_1.default
        });
        const ar = calculator.attackPower({
            strength: 33,
            dexterity: 21,
            intelligence: 34,
            faith: 54,
            arcane: 23,
        });
        (0, chai_1.expect)(ar.total).to.equal(424);
    });
    it('Crystal Sword +0 23/23/11/10/10 -> 166', () => {
        const calculator = new src_1.ArmamentCalculator('Crystal Sword', 'Standard', 0);
        calculator.importData({
            armaments: armaments_json_1.default,
            correction_attack: correction_attack_json_1.default,
            correction_graph: correction_graph_json_1.default,
            reinforcements: reinforcements_json_1.default
        });
        const ar = calculator.attackPower({
            strength: 23,
            dexterity: 23,
            intelligence: 11,
            faith: 10,
            arcane: 10,
        });
        (0, chai_1.expect)(ar.total).to.equal(166);
    });
    it('Lightning Broadsword +14 23/23/11/10/10 -> 365', () => {
        const calculator = new src_1.ArmamentCalculator('Broadsword', 'Lightning', 14);
        calculator.importData({
            armaments: armaments_json_1.default,
            correction_attack: correction_attack_json_1.default,
            correction_graph: correction_graph_json_1.default,
            reinforcements: reinforcements_json_1.default
        });
        const ar = calculator.attackPower({
            strength: 23,
            dexterity: 23,
            intelligence: 11,
            faith: 10,
            arcane: 10,
        });
        (0, chai_1.expect)(ar.total).to.equal(365);
    });
    it('Poison Clayman\'s Harpoon +14 23/23/11/10/10 -> 365', () => {
        const calculator = new src_1.ArmamentCalculator('Clayman\'s Harpoon', 'Poison', 14);
        calculator.importData({
            armaments: armaments_json_1.default,
            correction_attack: correction_attack_json_1.default,
            correction_graph: correction_graph_json_1.default,
            reinforcements: reinforcements_json_1.default
        });
        const ar = calculator.attackPower({
            strength: 23,
            dexterity: 23,
            intelligence: 11,
            faith: 10,
            arcane: 10,
        });
        const status = calculator.statusEffect({
            strength: 23,
            dexterity: 23,
            intelligence: 11,
            faith: 10,
            arcane: 10,
        });
        (0, chai_1.expect)(ar.total).to.equal(249);
        (0, chai_1.expect)(status.poison.total).to.equal(83);
    });
});
