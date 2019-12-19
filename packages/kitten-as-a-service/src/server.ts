import app from "./app";

const port = app.get("port");
const env = app.get("env");

const server = app.listen(app.get("port"), () => {
	console.info(`  App is running at http://localhost:${port} in ${env} mode`);
	console.info("  Press CTRL-C to stop\n");
});

export default server;
