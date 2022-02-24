# Multiple independent NestJS projects at the same repo 

The idea is to demonstrate an example of have multiple NextJS projects at the same repo and run them independently with fallback in a homologation URL

I know that are a lot of frameworks which promise to solve this with the "monorepo" concept, but I want to demonstrate how to achieve this without be locked-in in a framework or automation. It's is possible to reach it with a good decoupled code and Docker.

## Installation

Git clone this repo 
```bash 
git clone https://github.com/joelgarciajr84/nestjs-monorepo-microservices-proxy
```

```bash
Use docker compose to select which package do you wanna run.
```


## Usage

```bash
# To run only the Marvel API run:
docker-compose up marvel_api

# To run DC API and Auth api run
docker-compose up auth_api marvel_api

```

## What about the other packages(APIs)?

The project contains a ```cockpit project ``` that works as a reverse proxy(NGINX) for your APIs, for instance, imagine you are working on a feature that only affects ```marvel_api``` and ```dc_api``` you don't have to run ```auth_api``` locally, so, how to run the tests and debug?. Simple, with NGINX fallback:

```bash

  map $host $hml_base_url {
        default devenvironment.example.url.com;
    }

  location ~ ^/api/auth(/?.*)$ {
            proxy_pass http://auth_api:3000/auth$1?args;
            error_page 502 = @fallback_auth_api;
        }

        location @fallback_auth_api {
            proxy_set_header Host $hml_base_url;
            proxy_pass https://$hml_base_url/api/auth$1?args;
        }


```
With the settings above when was necessary to interact with ```auth_api``` the reverse proxy will redirect for the service running on homolog server, so the only thing you need to do is to interact is with your work feature.

![alt text](https://i.imgur.com/rAyOvRY.png)



## Where is the shared content?

IMHO a microservice could not import a package from another, the best way to share common code between services is via packages, in this case, npm libraries published with scope and in a private repo, such as Azure Artifacts.

This approach makes the container much lightweight, easy to test and to deploy.

## How to split the deploy?

In our approach we are using Github workflows, very easy to use, see:

```yml
name: Building Auth API

on:
  push:
    branches: [ main ]
    paths:
      - 'src/packages/auth/**'
  pull_request:
    branches: [ main ]

jobs:

  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Build the Docker image
      run: docker build . --file Dockerfile.AuthAPI  --tag monorepo_auth:$(date +%s)
```
What the code above does is, when whe push changes to the main branch at the path ``` src/packages/auth```(auth_api) the pipe will run, simple like that! :)

![alt text](https://i.postimg.cc/zBVKsznz/2022-02-23-21-03.png)
![alt text](https://i.postimg.cc/m2Nz6z03/2022-02-23-21-04.png)



## License
[MIT](https://choosealicense.com/licenses/mit/)
