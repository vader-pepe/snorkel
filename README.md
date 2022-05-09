# 🚀 Sechabeng

A **__weird__** solution to automatically do your social media task. This app can do all of your basic need on media social platform such as Facebook, Instagram, and Twitter (Possible to add more!).
This uses __puppeteer__ to execute the actions. Becareful! If you use VPS and the server location is different than your usual location, you will have a hard time.

## Features

- Post from Twitter to Facebook and Instagram
- All other features coming soon! 😃


## API Reference

#### POST From Twitter to FB and IG

```http
  POST /api/puppeteer
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `link` | `string` | **Required**. Link to your tweeet from twitter |
| `caption` | `string` | Your tweet |
| `user` | `string` | Your username |
| `created_at` | `string` | Date when the tweet was posted |
| `embed_code` | `string` | IDK actually. This comes from IFTTT |



## Run Locally

Clone the project

```bash
  git clone https://github.com/ihsankl/sechabeng
```

Go to the project directory

```bash
  cd sechabeng
```

Install dependencies

```bash
  yarn
```

Start the development server

```bash
  yarn start:dev
```


## Usage

You can hit with http request. Or better, use IFTTT and setup your webhook.

![IFTTT Example](https://i.imgur.com/keZYpNc.png)
## TODO List:

- Optimizing code. (Sometimes they not doing what I told them to do 😡)
- Adds video supports
- Add story supports
- All other infinite todo list goes here . . .


##  🖊️ Authors

- [@ihsankl](https://www.github.com/ihsankl)

