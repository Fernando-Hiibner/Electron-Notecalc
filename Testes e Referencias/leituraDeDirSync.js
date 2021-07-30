    // Leitura de diretórios sincrona
    // fs.readdirSync(__dirname).forEach(file => {
    //     if(fs.statSync(path.join(__dirname, file)).isDirectory())
    //     {
    //         let fileLi = document.createElement('p');
    //         fileLi.setAttribute('id', 'sidebarP');
    //         fileLi.innerText = file;
    //         sidebar.appendChild(fileLi);
    //     }
    // });
    // fs.readdirSync(__dirname).forEach(file => {
    //     if(fs.statSync(path.join(__dirname, file)).isFile())
    //     {
    //         let fileLi = document.createElement('p');
    //         fileLi.setAttribute('id', 'sidebarP');
    //         fileLi.innerText = file;
    //         sidebar.appendChild(fileLi);
    //     }
    // });

        // Async Read dir and place files and folders in the sidebar
    // var sidebar = document.getElementById('sidebar');
    // sidebar.innerText = path.basename(__dirname);
    // fs.readdir(__dirname, (err, files) => {
    //     if (err) console.log(err);
    //     else {files.forEach(file => {
    //         fs.lstat(path.join(__dirname, file), (err, stats) => {
    //             if(err) console.log(err);
    //             else if (stats.isDirectory()) {
    //                 let fileLi = document.createElement('p');
    //                 fileLi.setAttribute('id', 'sidebarP');
    //                 fileLi.innerText = ' '+file;
    //                 sidebar.appendChild(fileLi);
    //             }
    //         });
    //     })}
    // });
    // fs.readdir(__dirname, (err, files) => {
    //     if (err) console.log(err);
    //     else {files.forEach(file => {
    //         fs.lstat(path.join(__dirname, file), (err, stats) => {
    //             if(err) console.log(err);
    //             else if (stats.isFile()) {
    //                 let fileLi = document.createElement('p');
    //                 fileLi.setAttribute('id', 'sidebarP');
    //                 fileLi.innerText = file;
    //                 sidebar.appendChild(fileLi);
    //             }
    //         });
    //     })}
    // });
    var fs = require('fs');
    var path = require('path');
    var walk = function(dir, done) {
      var results = [];
      fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
          var file = list[i++];
          if (!file) return done(null, results);
          file = path.resolve(dir, file);
          fs.stat(file, function(err, stat) {
            if (stat && stat.isDirectory()) {
              walk(file, function(err, res) {
                results = results.concat(res);
                next();
              });
            } else {
              results.push(file);
              next();
            }
          });
        })();
      });
    };

    walk(process.env.HOME, function(err, results) {
      if (err) throw err;
      console.log(results);
    });