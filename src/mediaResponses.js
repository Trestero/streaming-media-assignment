// Node imports
const fs = require('fs');
const path = require('path');

// Generalized method to load a file of given type and stream it back
const getMediaFile = (request, response, filePath, contentType) => {
  const file = path.resolve(__dirname, filePath);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    // no error

    // get start and end from headers
    let { range } = request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    const positions = range.replace(/bytes=/, '').split('-');

    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    // correct bad range
    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    // response headers tell client what to expect
    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });

    // make a file stream and return
    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  getMediaFile(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  getMediaFile(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  getMediaFile(request, response, '../client/bird.mp4', 'video/mp4');
};


// Module exports
module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
