var config = require('../config/index.js');

var exec = require('child_process').exec;
var fs = require('fs');

var simpleGit = require('simple-git');

var Container = require('../models/container.js');
var containerApi = require('../apis/container.js');

module.exports = {
  'createContainer': function (req, res, next) {
    res.status(200).end();

    var containerName = req.params.containerName;
    var body = req.body;
    var kind = body['object_kind'];
    var repoBranch = body.ref;
    var containerUrl = config.server.host + ':' + config.server.port + '/webhook/container/' + containerName;

    console.log(containerUrl);
    console.log(kind);
    console.log(repoBranch);

    // if (repoBranch == 'refs/heads/master') {
    //   Container.getByUrl(containerUrl, function (error, container) {
    //     if (error) {
    //       res.status(200).end();
    //       return res.end();
    //     }
    //
    //     var dir = container.dir;
    //     var repoCloneUrl = body.repository.clone_url;
    //
    //     // 获取 GitHub 代码，npm install
    //     fs.exists(config.repo.location + '/' + container.name, function (exists) {
    //       if (exists) {
    //         simpleGit(config.repo.location + '/' + container.name)
    //         .pull(function (error, result) {
    //           if (error) {
    //             console.log(error);
    //             return res.status(200).end();
    //           }
    //           exec('rm -rf node_modules', {
    //             'cwd': config.repo.location + '/' + container.name
    //           }, function (error, stdout, stderr) {
    //             if (error || stderr) {
    //               console.log(error);
    //               console.log('stderr: ' + stderr);
    //               return res.status(200).end();
    //             }
    //             exec('npm install', {
    //               'cwd': config.repo.location + '/' + container.name
    //             }, function (error, stdout, stderr) {
    //               if (error || stderr) {
    //                 console.log(error);
    //                 console.log('stderr: ' + stderr);
    //                 return res.status(200).end();
    //               }
    //               // 启动容器
    //               run(req, res, container);
    //             });
    //           });
    //         });
    //       } else {
    //         simpleGit(config.repo.location)
    //         .clone(repoCloneUrl, container.name, function (error) {
    //           if (error) {
    //             console.log(error);
    //             return res.status(200).end();
    //           }
    //           exec('npm install', {
    //             'cwd': config.repo.location + '/' + container.name
    //           }, function (error, stdout, stderr) {
    //             if (error || stderr) {
    //               console.log(error);
    //               console.log('stderr: ' + stderr);
    //               return res.status(200).end();
    //             }
    //             // 启动容器
    //             run(req, res, container);
    //           });
    //         });
    //       }
    //     });
    //   });
    // }

    if (repoBranch == 'refs/heads/master') {
      Container.getByUrl(containerUrl, function (error, container) {
        if (error) {
          console.error(error);
        }

        var dir = container.dir;

        // 获取代码
        simpleGit(dir)
        .pull(function (error, result) {
          if (error) {
            console.log(error);
          }

          console.log('fetch code success');

          // 启动容器
          run(req, res, container);
        });
      });
    }

  }  // end container
};

function run(req, res, container) {
  // if (container.Id != '') {
    containerApi.startContainer(container.Id, function (error) {
      if (error) {
        if (error == 304) {
          containerApi.reStartContainer(container.Id, function (error) {
            if (error) {
              console.log(error);
            }
          });
        } else {
          console.log(error);
        }
      }
    });
  // } else {
  //   console.log('null');
  //   var containerInfo = {
  //     'Image': container.image,
  //     'Cmd': ['/bin/bash', '-c', container.command],
  //     'Volumes': { '/code': {} },
  //     'WorkingDir': '/code',
  //     'ExposedPorts': { '3000/tcp': {} },
  //     'HostConfig': {
  //       'Binds': [ container.dir + ':/code' ],
  //       'PortBindings': { '3000/tcp': [{ 'HostPort': '' + container.port }] }
  //     }
  //   };
  //   containerApi.createContainer(container.name, containerInfo, function (error, result) {
  //     if (error) {
  //       console.log(error);
  //       res.status(200).end();
  //       return res.end();
  //     }
  //     console.log('result: ' + result);
  //     Container.insertIdFromApiToMongodb(container._id, result.Id, function (error, container) {
  //       if (error) {
  //         console.log(error);
  //         res.status(200).end();
  //         res.end();
  //       }
  //       console.log('container: ' + container);
  //       containerApi.startContainer(container.Id, function (error) {
  //         if (error) {
  //           if (error == 304) {
  //             containerApi.reStartContainer(container.Id, function (error) {
  //               if (error) {
  //                 console.log(error);
  //                 res.status(200).end();
  //                 return res.end();
  //               }
  //               return res.end();
  //             });
  //           } else {
  //             console.log(error);
  //             res.status(200).end();
  //             return res.end();
  //           }
  //         } else {
  //           res.end();
  //         }
  //       });
  //     });
  //   });
  // }
}

