

## setup
```
  "jest": {
    "testEnvironment": "node"
  },
```

## jest parameters
```
cross-env DATABASE_URI=mongodb://localhost:27017/recipe_app_test jest --collectCoverage --forceExit --detectOpenHandles
```
