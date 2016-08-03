#/bin/bash
edpPath=`echo $(edp --version) | cut -d " " -f 2` 
libPath="$edpPath/../edp-webserver/lib/util"
cd $libPath

#download files
fileUrl='http://cq01-rdqa-dev009.cq01.baidu.com:8000/util'
files=(filecache.js compile-and-write-stylus.js compile-and-write-less.js)
for file in ${files[@]}
do
	rm "./$file"
	wget "$fileUrl/$file"
done
echo done
