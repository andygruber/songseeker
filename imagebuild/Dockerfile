FROM nginx

RUN rm -rf /usr/share/nginx/html/*
COPY *.js *.csv *.html *.css *.png /usr/share/nginx/html/
ADD --chmod=444 https://raw.githubusercontent.com/andygruber/songseeker-hitster-playlists/main/hitster-de.csv /usr/share/nginx/html/
