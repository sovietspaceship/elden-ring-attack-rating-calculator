"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmamentCalculator = exports.AttackPower = void 0;
class ComputedValue {
    constructor(base, scaling) {
        this.base = base;
        this.scaling = scaling;
    }
    get total() {
        return Math.floor(this.base + this.scaling);
    }
}
class AttackPower {
    constructor(values) {
        this.values = values;
    }
    get total() {
        return Math.floor(this.items.reduce((acc, value) => acc + value.total, 0));
    }
    get items() {
        return Object.values(this.values);
    }
    map(callback) {
        return new AttackPower(['physical', 'fire', 'lightning', 'magic', 'holy'].reduce((acc, key) => {
            return Object.assign(Object.assign({}, acc), { [key]: callback(key, this.values[key]) });
        }, {}));
    }
    static create() {
        return new AttackPower({ fire: new ComputedValue(0, 0), holy: new ComputedValue(0, 0), lightning: new ComputedValue(0, 0), magic: new ComputedValue(0, 0), physical: new ComputedValue(0, 0) });
    }
}
exports.AttackPower = AttackPower;
class ArmamentCalculator {
    constructor(name, affinity, level) {
        this.name = name;
        this.affinity = affinity;
        this.level = level;
    }
    importData(data) {
        const affinityProperties = data.armaments[this.name].affinity[this.affinity];
        const reinforcementId = affinityProperties.reinforcement_id;
        const correctionAttackId = affinityProperties.correction_attack_id;
        this.gameData = {
            affinity_properties: affinityProperties,
            requirements: data.armaments[this.name].requirements,
            reinforcement: data.reinforcements[reinforcementId.toString()][this.level],
            correction_attack: data.correction_attack[correctionAttackId],
            correction_graph: data.correction_graph,
        };
    }
    attackPower(attributes) {
        return AttackPower.create().map(attackType => this.getBaseAndScaledDamage(attributes, attackType));
    }
    getBaseAndScaledDamage(attributes, attackType) {
        const base = (this.gameData.affinity_properties.damage[attackType] || 0) * (this.gameData.reinforcement.damage[attackType] || 0);
        const scalings = Object.keys(attributes).map((attribute) => {
            return this.getScalingPerAttribute(attackType, attribute, attributes[attribute] || 0);
        });
        const lowCap = Math.min(...scalings);
        const scalingValue = Math.max(lowCap, scalings.reduce((acc, s) => acc + s));
        return new ComputedValue(base, base * scalingValue);
    }
    getScalingPerAttribute(attackType, attribute, value) {
        // attack type does not scale with this attribute
        if (!this.gameData.correction_attack.correction[attackType][attribute]) {
            return 0.0;
        }
        // get the impact ratio of the scaling for this attack type and attribute
        const scaling_impact_ratio = this.gameData.correction_attack.ratio[attackType][attribute] || 0;
        // requirement is not met, penalize scaling of this attack type for this attribute
        if (value < this.gameData.requirements[attribute]) {
            return 0.6 * (scaling_impact_ratio - 1) - 0.4;
        }
        // get scaling values for armament and its particular reinforcement level
        const base_scaling = this.gameData.affinity_properties.scaling[attribute] || 0;
        const level_scaling = this.gameData.reinforcement.scaling[attribute] || 0;
        // override base scaling if an override is defined
        const final_base_scaling = this.gameData.correction_attack.override[attackType][attribute] || base_scaling;
        // get correction for scaling based on the attribute value
        const correction_id = this.gameData.affinity_properties.correction_calc_id[attackType];
        const scaling_correction = this.gameData.correction_graph[correction_id][value];
        // return actual scaled value for this attack type and attribute
        return scaling_impact_ratio - 1 + final_base_scaling * level_scaling * scaling_correction * scaling_impact_ratio;
    }
    statusEffect(attributes) {
        const results = {
            bleed: new ComputedValue(0, 0),
            frostbite: new ComputedValue(0, 0),
            poison: new ComputedValue(0, 0),
            scarlet_rot: new ComputedValue(0, 0),
            sleep: new ComputedValue(0, 0),
            madness: new ComputedValue(0, 0)
        };
        for (const status in results) {
            results[status] = this.getBaseAndScaledEffect(attributes, status);
        }
        return results;
    }
    getBaseAndScaledEffect(attributes, effectType) {
        let base = this.gameData.affinity_properties.status_effects[effectType] || 0;
        const overlays = this.gameData.affinity_properties.status_effect_overlay;
        const level = this.gameData.reinforcement.level;
        // overwrite base value if the effect upgrades for the affinity
        if (overlays.length > level && overlays[level][effectType]) {
            base = overlays[level][effectType];
        }
        // retrieve scaling value if the effect can scale
        const correctionId = this.gameData.affinity_properties.correction_calc_id[effectType];
        if (correctionId) {
            const base_scaling = this.gameData.affinity_properties.scaling.arcane;
            const level_scaling = this.gameData.reinforcement.scaling.arcane;
            const scaling_correction = this.gameData.correction_graph[correctionId][attributes.arcane];
            return new ComputedValue(base, base * base_scaling * level_scaling * scaling_correction);
        }
        return new ComputedValue(base, 0.0);
    }
}
exports.ArmamentCalculator = ArmamentCalculator;
