#/bin/env python
# -*- coding: utf8 -*-
import codecs
import json

file_writer = codecs.open("finallyResult.txt", encoding="utf8", mode="wb")


id_set = set()
count=0
with codecs.open("result3.txt", encoding="utf8", mode="r") as file_content:
	for line in file_content:
		count+=1
		print count
		try:
			js = json.loads(line.strip())
			if js['cid'] not in id_set:
				file_writer.write(line)
				id_set.add(js['cid'])
		except Exception, e:
			print e.message

file_writer.close()

datas = []
function a(url){
	http.get(url){
		req.end(function(){
			url = url + 1
			a(url)
			datas,push(da);
		})
	}
}