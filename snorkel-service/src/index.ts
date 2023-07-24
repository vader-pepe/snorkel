import Client from "./Client";

function main() {
  const client = new Client()
  client.initialize()
  client.on('ready', () => {
    console.log('ready')
  })

}

main()
