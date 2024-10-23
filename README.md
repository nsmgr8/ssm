# Storm Surge Model

Finite difference storm surge model runner and viewer.

## Requirements

The model is developed in python and has an API server to run the model.
The results the run can be viewed in a web based frontend developed in React JS.

To run and view results the following is required:

1. Linux/macOS/Windows WSL
2. git
3. make
4. Docker Desktop

## Run the app

In the project root, run the following make command:

```sh
make up
```

This will setup the necessary containers to run the app.

Now in your web browser go to the location: [http://localhost:3000].
