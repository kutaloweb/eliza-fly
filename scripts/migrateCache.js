import fs, { glob } from "fs/promises";
import path from "path";

const characterName = "eliza";
const newCacheDir = path.resolve(`./data/${characterName}/cache`);

const twitterUserName = "";

const cachedFiles = {
    [`tweetcache/${twitterUserName}_cookies.json`]: `twitter/${twitterUserName}/cookies`,
    "tweetcache/latest_checked_tweet_id.txt": `twitter/${twitterUserName}/latest_checked_tweet_id`,
    "tweetcache/home_timeline.json": `twitter/${twitterUserName}/timeline`,
    "tweetcache/tweet_generation_*.txt": "twitter/",
    "tweetcache/tweet_generation_*.txt": "twitter/",
    "tweetcache/**/*.json": `twitter/tweets/`,

    "content_cache/**.mp4": "content/video/",
    "content_cache/*": "content/",
};

async function migrate() {
    console.log({ newCacheDir });
    await fs.mkdir(newCacheDir, { recursive: true });

    for (const key in cachedFiles) {
        if (!key) continue;
        const results = await glob(["./packages/**/" + key]);

        console.log({ searching: key });

        for await (const result of results) {
            if (result.includes("node_modules")) continue;

            const filePath = path.resolve("./", result);

            const cacheKey = /** @type {string} */ (cachedFiles[key]);

            const filename = cacheKey.endsWith("/")
                ? path.join(
                      cacheKey,
                      path.basename(filePath, path.extname(filePath))
                  )
                : cacheKey;

            const absolutePath = path.join(newCacheDir, filename) + ".json";

            console.log(filePath, absolutePath);

            const data = await fs.readFile(filePath, "utf8");

            await fs.mkdir(path.dirname(absolutePath), { recursive: true });

            await fs.writeFile(
                absolutePath,
                JSON.stringify({
                    value: data,
                    expires: 0,
                }),
                "utf8"
            );

            await fs.unlink(filePath);
        }
    }
}

migrate().catch((err) => console.error(err));
