# How to run locally

## Step one

Install the dependencies.

```sh
npm i
```

## If you want to run the PWA

### Generate self signed cert

```sh
chmod +x ./certscript.sh # make script executable
./certscript.sh # run script
```

### Build

```sh
npm run build
```

### Run preview

```sh
npx vite preview
```

## Otherwise

### Run the dev-server

```sh
npx vite serve
```
