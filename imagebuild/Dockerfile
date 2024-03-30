FROM alpine:latest AS unzipper
RUN apk add --no-cache wget unzip
RUN mkdir /tmp/playlists && \
  wget -O /tmp/hitster-youtube-playlists.zip https://github.com/andygruber/songseeker-hitster-playlists/releases/latest/download/hitster-youtube-playlists.zip && \
  unzip /tmp/hitster-youtube-playlists.zip -d /tmp/playlists/

FROM nginx
RUN rm -rf /usr/share/nginx/html/*
COPY *.js *.json *.csv *.html *.css *.png icons/* /usr/share/nginx/html/
COPY --chmod=444 --from=unzipper /tmp/playlists/ /usr/share/nginx/html/
