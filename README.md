# LakeEffectScoutingSummary

Summarizes scouting data into understandable words.

Has an electron app local version and a server-based remote version.

The server-based version supports file uploading, photo uploading and `https`. They both run off the same codebase, meaning updates will work on both versions.

# Instructions

Put scouting data in a folder called data (in the root directory of the program).

Put robot images in a folder called photos (labeled as [robot number].JPG).

Scouting data is generated with https://github.com/LakeEffectRobotics/LakeEffectScoutingApp.

# Run from source

Install the dependencies with `npm install`

Run the electron app with `npm start`

If you want to run the server based version, use `node server`
Then access the page at `http://localhost:8080`
It also supports `https`, the certificates can be placed into the `certificates` folder as `certificate.crt` and `private.key`.
The password for the data upload page should be stored in the `certificates` folder in a file called `password.txt`.
