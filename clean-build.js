var path = require('path'), fs=require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;

var archive = true;

function fromDir(startPath,filter,callback){
    //console.log('Starting from dir '+startPath+'/');
    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) callback(filename);
    };
};

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), function (err) {
    if (err) return cb(err);

    fs.writeFile(path, contents, cb);
  });
}

console.log("## Looking for typescript files in '%s' ##", 'src')
var filesToDelete = [];
fromDir('src',/\.ts$/,function(filename){
    console.log('-- found: %s',filename);
    
    var js = filename.replace(/.ts$/g, ".js");
    filesToDelete.push(js);
    var jsmap = filename.replace(/.ts$/g, ".js.map");
    filesToDelete.push(jsmap);
});

if (archive)
{
    console.log("## Typescript generated javascript files to archive:");
}
else
{
    console.log("## Typescript generated javascript files to delete:");    
}
// create archive folder
var date = new Date();
var archiveFolder = "archive\\" + date.getDate() + "-" + (date.getMonth()+1) + "-" +date.getFullYear() + "[" + date.getHours() + "." + date.getMinutes() + "." + date.getSeconds() + "]\\";

for(var index in filesToDelete)
{
    var file = filesToDelete[index];
    if (!fs.existsSync(file))
    {
        console.log("file does not exists: %s", file);
    }
    else
    {
        // move into archive folder
        // console.log("delete:", file);
        var content = fs.readFileSync(file);

        if(archive)
        {
            // move to archive folder
            var unlink = true;
            console.log("moving to archive: %s", archiveFolder + file );
            writeFile(archiveFolder + file, content, function(error)
            {
                if(error != null)
                {
                    unlink = false;
                    console.log("error: ", error );
                }
            });


            if(unlink)
            {
                fs.unlink(file);
            }
        }
        else
        {
            console.log("deleting file: %s", file );
            fs.unlink(file);
        }
    }
}