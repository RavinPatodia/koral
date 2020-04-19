const exec = require('child_process').execSync
exports.run = async function(req,res){
  let id = req.params.id;
  try {
      exec('sh ../test.sh')
      console.log("exec script successful")
      let response = {message:"successful"};
      res.json(response);
  } catch (error) {
      console.error(error)
  }
}