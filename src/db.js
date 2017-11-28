import Promise from 'bluebird'
import moment from 'moment'
import _ from 'lodash'
import { DatabaseHelpers as helpers } from 'botpress'

var knex = null

function initialize() {
  if (!knex) {
    throw new Error('you must initialize the database before')
  }

  return helpers(knex).createTableIfNotExists('hitl_sessions', function (table) {
    table.increments('id').primary()
    table.string('platform')
    table.string('userId')
    table.string('full_name')
    table.string('user_image_url')
    table.timestamp('last_event_on')
    table.timestamp('last_heard_on')
    table.boolean('paused')
    table.string('paused_trigger')
  })
  .then(function() {
    return helpers(knex).createTableIfNotExists('hitl_messages', function (table) {
      table.increments('id').primary()
      table.integer('session_id').references('hitl_sessions.id').onDelete('CASCADE')
      table.string('type')
      table.string('text')
      table.jsonb('raw_message')
      table.enu('direction', ['in', 'out'])
      table.timestamp('ts')
    })
    .then(function(){
      helpers(knex).hasColumn('hitl_messages', 'sent_by').then(status => {
        if(!status){
          return helpers(knex).addColumnToTable('hitl_messages', function(table){
            table.string('sent_by')
          })
        } else {
          return
        }
      })
    })
  })
}

function createUserSession(event) {
  let profileUrl = null
  let full_name = '#' + Math.random().toString().substr(2)

  if (event.user && event.user.first_name && event.user.last_name) {
    profileUrl = event.user.profile_pic || event.user.picture_url
    full_name = event.user.first_name + ' ' + event.user.last_name
  }
  
  const session = { 
    platform: event.platform,
    userId: sanitizeUserId(event.user.id),
    user_image_url: profileUrl,
    last_event_on: helpers(knex).date.now(),
    last_heard_on: helpers(knex).date.now(),
    paused: 0,
    full_name: full_name,
    paused_trigger: null,
    ip: event.raw && event.raw.ip
  }

  return knex
  .insert(session)
  .returning('id')
  .into('hitl_sessions')
  .then(results => {
    session.id = results[0]
    session.is_new_session = true
  })
  .then(() => knex('hitl_sessions').where({ id: session.id }).then().get(0))
  .then(db_session => Object.assign({}, session, db_session))
}

// function updateUserSession(event, fields){
//   const userId = (event.user && sanitizeUserId(event.user.id)) || sanitizeUserId(event.raw.to)
//   return knex('hitl_sessions')
//   .where({ platform: event.platform, userId: userId })
//   .update(fields)
// }

function getUserSession(event) {
  const userId = (event.user && sanitizeUserId(event.user.id)) || sanitizeUserId(event.raw.to)
  return knex('hitl_sessions')
  .where({ platform: event.platform, userId: userId })
  .select('*')
  .limit(1)
  .then(users => {
    if (!users || users.length === 0) {
      return createUserSession(event)
    } else {
      return users[0]
    }
  })
}

function getSession(sessionId) {
  return knex('hitl_sessions')
  .where({ id: sessionId })
  .select('*')
  .limit(1)
  .then(users => {
    if (!users || users.length === 0) {
      return null
    } else {
      return users[0]
    }
  })
}

function toPlainObject(object) {
  // trims SQL queries from objects
  return _.mapValues(object, v => {
    v = _.includes(["null", "undefined"], String(v)) ? 'undefined' : v
    return v.sql ? v.sql : v
  })
}

function sanitizeUserId(userId){
  if(_.includes(["undefined", "null"], String(userId))) { return userId }
  return userId.replace("webchat:", "")
}

function appendMessageToSession(event, sessionId, direction) {

  let message = {
    session_id: sessionId,
    type: event.type,
    text: event.text,
    raw_message: event.raw,
    direction: direction,
    sent_by: event.sent_by,
    ts: helpers(knex).date.now()
  }

  const ip = event.raw && event.raw.ip
  const update = { last_event_on: helpers(knex).date.now(), ip }

  if (direction === 'in') {
    update.last_heard_on = helpers(knex).date.now()
  }

  return knex('hitl_messages')
  .insert(message)
  .then(() => {
    return knex('hitl_sessions')
    .where({ id: sessionId })
    .update(update)
    .then(() => toPlainObject(Object.assign({}, message, {ip})))
  })  
}

function setSessionPaused(paused, platform, userId, trigger, sessionId = null) {
  if (sessionId) {
    return knex('hitl_sessions')
    .where({ id: sessionId })
    .update({ paused: paused ? 1 : 0, paused_trigger: trigger })
    .then(() => parseInt(sessionId))
  } else {
    return knex('hitl_sessions')
    .where({ userId, platform })
    .update({ paused: paused ? 1 : 0, paused_trigger: trigger })
    .then(() => {
      return knex('hitl_sessions')
      .where({ userId, platform })
      .select('id')
    })
    .then(sessions => parseInt(sessions[0].id))
  }
}

function isSessionPaused(platform, userId, sessionId = null) {
  const toBool = s => helpers(knex).bool.parse(s)

  if (sessionId) {
    return knex('hitl_sessions')
    .where({ id: sessionId })
    .select('paused').then().get(0).then(s => s && toBool(s.paused))
  } else {
    return knex('hitl_sessions')
    .where({ userId, platform })
    .select('paused').then().get(0).then(s => s && toBool(s.paused))
  }
}

function getAllSessions(onlyPaused) {
  let condition = ''

  if (onlyPaused === true) {
    condition = 'hitl_sessions.paused = ' + helpers(knex).bool.true()
  }

  return knex.select(['q1.*', "hitl_messages.*", "hitl_sessions.*", "users.email", "users.phone_no", knex.raw("users.first_name || ' ' || users.last_name as full_name")])
  .from(function() {
    this.select([knex.raw('max(id) as mId'), 'session_id', knex.raw('count(*) as count')])
    .from('hitl_messages')
    .groupBy('session_id')
    .as('q1')
  })
  .join('hitl_messages', knex.raw('q1.mId'), 'hitl_messages.id')
  .join('hitl_sessions', knex.raw('q1.session_id'), 'hitl_sessions.id')
  .leftJoin(knex.raw('users on users."userId" = hitl_sessions."userId" and users.platform = hitl_sessions.platform'))
  .whereRaw(condition)
  .orderBy('hitl_sessions.last_event_on', 'desc')
  .limit(100)
  .then(results => ({
    total: 0,
    sessions: results
  }))
}

function getSessionData(sessionId) {
  const isLite = knex.client.config.client === "sqlite3"
  const data = knex('hitl_sessions')
  .where({ 'session_id': sessionId })
  .join('hitl_messages', 'hitl_messages.session_id', 'hitl_sessions.id')
  .orderBy('hitl_messages.id', 'desc')
  .limit(100)
  if (isLite){
    return data
    .select('*')
    .then(messages => _.orderBy(messages, ['id'], ['asc']))
  }
  else {
    return data
    .select('*', knex.raw("case when type = 'template' then raw_message->'payload'->'text' when type = 'postback' then raw_message->'postback'->'title' when type = 'quick_reply' then raw_message->'message'->'text' end as payload_text"))
    .then(messages => _.orderBy(messages, ['id'], ['asc']))
  }
}

module.exports = k => {
  knex = k

  return {
    initialize,
    getUserSession,
    setSessionPaused,
    appendMessageToSession,
    getAllSessions,
    getSessionData,
    getSession,
    isSessionPaused
  }
}