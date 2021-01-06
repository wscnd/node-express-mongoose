// error handler
export default function (err, req, res, next) {
  req.app?.get('env') === 'development'
    ? console.log(err.message)
    : console.log(err.message)

  /* 
  name:
  message:
  index:
  code:
  errmsg: */

  res.status(err.status).send(JSON.stringify({ message: err.message }))
  res.end()
}
