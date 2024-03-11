FROM busybox:latest AS unzipper
RUN mkdir /tmp/playlists && \
  wget -O /tmp/hitster-youtube-playlists.zip https://github.com/andygruber/songseeker-hitster-playlists/releases/download/v0.0.99/hitster-youtube-playlists.zip && \
  unzip /tmp/hitster-youtube-playlists.zip -d /tmp/playlists/

FROM nginx
RUN rm -rf /usr/share/nginx/html/*
COPY *.js *.csv *.html *.css *.png /usr/share/nginx/html/
COPY --chmod=444 --from=unzipper /tmp/playlists/ /usr/share/nginx/html/
