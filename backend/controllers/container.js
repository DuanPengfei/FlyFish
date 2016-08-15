'use strict';

var crypto = require('crypto');

var config = require('../config/index.js');

var Container = require('../models/container.js');
var containerApi = require('../apis/container.js');
var imageApi = require('../apis/image.js');

module.exports = {
  'getRunningContainers': function (req, res, next) {
    containerApi.getContainers(function (error, containers) {
      if (error) {
        console.error(error);
        return res.redirect('/internal_error');
      }

      var currentUser = req.session.user.username;
      var upContainers = [];
      var exitContainers = [];
      // console.log(currentUser);

      for (var i = 0, length = containers.length; i < length; i++) {
        var containerName = containers[i].Names[0].slice(1);
        // var containerUser = containerName.split('-')[0];

        // console.log(containerUser);

        // if (containerUser == currentUser) {
          // timestamp to date
          var date = new Date(containers[i].Created * 1000);
          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          var day = date.getDate();
          var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
          var min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
          var sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
          var created = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;

          var c = {
            'Id': containers[i].Id,
            'name': containerName,
            'image': containers[i].Image,
            'port': containers[i].Ports.length > 0 ? containers[i].Ports[0].PublicPort + ':' + containers[i].Ports[0].PrivatePort : '',
            'created': created
          };

          if (containers[i].Status.split(' ')[0] == 'Up') {
            upContainers.push(c);
          } else {
            exitContainers.push(c);
          }
        // }
      }

      res.render('container/running', {
        'title': config.language.RUNNING_CONTAINER,
        'user': req.session.user,
        'error': req.flash('error').toString(),
        'success': req.flash('success').toString(),

        'upContainers': upContainers,
        'exitContainers': exitContainers
      });
    });
  },  // end getRunningContainer

  'getCreatedContainers': function (req, res, next) {
    var userId = req.params.userId;

    Container.getByUserId(userId, function (error, containers) {
      if (error) {
        console.error(error);
        return res.render('/internal_error');
      }

      res.render('container/created', {
        'title': config.language.CREATED_CONTAINER,
        'user': req.session.user,
        'error': req.flash('error').toString(),
        'success': req.flash('success').toString(),

        'containers': containers
      })
    });
  },  // end getCreatedContainer

  'getContainerInfo': function (req, res, next) {
    var containderId = req.params.containerId;

    containerApi.getContainerInfo(containderId, function (error, container) {
      var portBindings = container.HostConfig.PortBindings;
      var ports = [];

      for (var key in portBindings) {
        ports.push(portBindings[key][0].HostPort + ': ' + key);
      }

      // formate created
      var created = container.Created;
      var tmpArr = created.split('T');
      var date = tmpArr[0];
      var time = tmpArr[1].split('.')[0];
      created = date + ' ' + time;

      var c = {
        'id': container.Id,
        'name': container.Name.slice(1),
        'image': container.Config.Image,
        'ports': JSON.stringify(ports),
        'binds': JSON.stringify(container.HostConfig.Binds),
        'pwd': container.Config.WorkingDir,
        'command': container.Config.Cmd.join(' '),
        'status': container.State.Status,
        'created': created
      };

      function syntaxHighlight(json) {
        if (typeof json != 'string') {
          json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
          var cls = 'number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key';
            } else {
              cls = 'string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          }
          return '<span class="' + cls + '">' + match + '</span>';
        });
      }

      var containerDetail = syntaxHighlight(container);

      res.render('container/info', {
        'title': config.language.CONTAINER_INFO,
        'user': req.session.user,
        'error': req.flash('error').toString(),
        'success': req.flash('success').toString(),

        'server': config.server.host,
        'containerInfo': c,
        'containerDetail': containerDetail
      });
    });
  },  // end getOneContainer

  'createContainer': function (req, res, next) {
    if (req.method == 'GET') {
      imageApi.getImages(function (error, images) {
        if (error) {
          console.error(error);
          return res.render('/internal_error');
        }

        for (var i = 0, length = images.length; i < length; i++) {
          images[i] = images[i].RepoTags[0];
        }

        containerApi.getContainers(function (error, containers) {
          if (error) {
            console.error(error);
            return res.render('/internal_error');
          } else {
            res.render('container/create', {
              'title': config.language.CREATE_CONTAINER,
              'user': req.session.user,
              'error': req.flash('error').toString(),
              'success': req.flash('success').toString(),

              'containers': containers,
              'images': images
            });
          }
        });
      });
    } else if (req.method == 'POST') {
      var body = req.body;
      var container = JSON.parse(body.container);

      var id = container.Id;
      var dir = container.Mounts[0].Source;
      var name = container.Names[0].slice(1, container.Names[0].length);
      var image = container.Image;
      var command = container.Command;
      var ports = [];
      container.Ports.forEach(function (Port) {
        ports.push(Port.PublicPort);
      });

      var url = config.server.host + ':' + config.server.port + '/webhook/container/' + crypto.createHash('md5').update(name).digest('hex');

      var newContainer = {
        'name': name,
        'image': image,
        'command': command,
        'ports': ports,
        'Id': id,
        'dir': dir,
        // 'link': [],
        'url': url,
        'user_id': req.session.user._id,
        'start_at': new Date().getTime(),
        // 'restart_at': 0,
        // 'exit_at': 0,
        // 'restart_num': 0,
        // 'exit_num': 0,
        // 'error_exit_num': 0,
        // 'deleted': 0
      };

      Container.getByName(name, function (error, container) {
        if (error) {
          console.error(error);
          return res.render('/internal_error');
        }
        if (container) {
          req.flash('error', '容器名已被占');
          return res.redirect('/container/create');
        }
        Container.insert(newContainer, function (error, container) {
          if (error) {
            console.error(error);
            return res.render('/internal_error');
          }

          var successMessage = '容器创建成功, 请将: ' + container.url + ' 添加到 GitHub 项目的 WebHook 地址栏中。';
          req.flash('success', successMessage);
          res.redirect('/container');
        })
      });
    }
  },  // end createContainer

  'restartContainer': function (req, res, next) {
    var containerId = req.params.containerId;

    containerApi.reStartContainer(containerId, function (error, result) {
      if (error) {
        console.error(error);
        return res.render('/internal_error');
      }

      res.redirect('/container/' + containerId);
    });
  },  // end restartContainer

  'stopContainer': function (req, res, next) {
    var containerId = req.params.containerId;

    containerApi.stopContainer(containerId, function (error, result) {
      if (error) {
        console.error(error);
        return res.render('/internal_error');
      }

      res.redirect('/container/' + containerId);
    });
  },  // end restartContainer

  'startContainer': function (req, res, next) {
    var containerId = req.params.containerId;

    containerApi.startContainer(containerId, function (error, result) {
      if (error) {
        console.error(error);
        return res.render('/internal_error');
      }

      res.redirect('/container/' + containerId);
    });
  }  // end restartContainer
};

