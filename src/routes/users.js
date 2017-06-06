'use strict';

var cookieParser = require('cookie-parser');

var cookieOptions = {
  httpOnly: true,
  domain: '.emunova.net'
};

module.exports = function(app){
  var routes = require('express').Router();

  routes.get('/me', cookieParser(null, cookieOptions), function(req, res){
    if (!req.cookies.ips4_member_id) {
      return res.status(401).send({});
    }

    app.locals.db
      .select('name', 'members_seo_name')
      .where('member_id', req.cookies.ips4_member_id)
      .from('ibf_members')
      .limit(1)
      .first()
      .then(successResponse, errorResponse);

    //
    function successResponse(row){
      res.setHeader('Cache-Control', 'private');
      res.setHeader('Expires', new Date(Date.now() + 3600000));

      res.json({
        user: {
          id: Number(req.cookies.ips4_member_id),
          name: row.name,
          slug: row.members_seo_name,
          profile_url: `https://forums.emunova.net/user/${req.cookies.ips4_member_id}-${row.members_seo_name}/`
        }
      });
    }

    function errorResponse(err){
      console.error('Failed to fetch user informations.');
      console.error(err);

      res.status(403).json({});
    }
  });

  return routes;
};
