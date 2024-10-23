# Storm Surge Model

Finite difference storm surge model runner and viewer.

The model is developed in python and has an API server to run the model.
The results the run can be viewed in a web based frontend developed in React JS.

## Run the app on Windows

Install [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
on your windows machine. A logout/restart is required.

To develop and contribute, optionally install [git (scm)](https://git-scm.com/downloads/win)
and [clone it](https://github.com/nsmgr8/ssm.git) using your favorite git client.

Otherwise, it can be also [downloaded as a zip file](https://github.com/nsmgr8/ssm/archive/refs/heads/main.zip).

In the project root folder, double click the `run.bat` file.

## Run the app on Linux/macOS

Install Docker Desktop, git, make with your preferred package manager or from the websites.

In the project root, run the following make command:

```sh
make up
```

This will setup the necessary containers to run the app.

## Access the app

Now in your web browser go to the location: [http://localhost:3000].
