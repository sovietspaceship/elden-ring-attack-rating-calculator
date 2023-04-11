
# Elden Ring Attack Rating Calculator

Attack Rating and Status Effect calculator written in TypeScript, ported from [erdb's implementation](https://github.com/EldenRingDatabase/erdb/wiki/Calculating-Attack-Power-in-Elden-Ring) and using [erdb data](https://github.com/EldenRingDatabase/erdb). Used by the [Elden Ring Build & Inventory Planner](https://er-inventory.nyasu.business).

# Install

npm install github:sovietspaceship/er-attack-rating-calculator

# Generate the required data

Install [erdb](https://github.com/EldenRingDatabase/erdb).

To generate the required data:

erdb generate armaments correction-attack correction-graph reinforcements

# Contributing

Source code is in `src/index.ts`. Do not edit any other file in `src/`, are generated for plain JavaScript support.

# Tests

```
npm test
```

Tests are located in `tests/` and use Jest.
