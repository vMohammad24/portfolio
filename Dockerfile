FROM oven/bun:debian AS base
WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y fonts-noto fontconfig && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean && \
    rm -rf /tmp/* /var/tmp/* && \
    fc-cache -fv

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun --bun run build

FROM base AS release
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/node_modules ./node_modules/
COPY --from=prerelease /usr/src/app/build ./build/


USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "./build/index.js" ]