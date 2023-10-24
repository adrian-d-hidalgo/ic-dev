# Docker

## Build Core Image

```
docker buildx build -t idealizer/dfx-core ./docker/core --platform=linux/amd64,linux/x86_64
```

## Run Core Image

```
docker run -v .:/root/dfx/{{project_name}} -p 8080:8080 --name dfx-core -it idealizer/dfx-core bash
```

## Start Services

```
service nginx start
dfx start
```
