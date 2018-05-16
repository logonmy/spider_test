#/bin/env python
# -*- coding: utf8 -*-
import codecs
import json

file_writer = codecs.open("/Users/cqcpcqp/Downloads/d/最后的百度知道/result_res.txt", encoding="utf8", mode="wb")


id_set = set()
count=0
with codecs.open("/Users/cqcpcqp/Downloads/d/最后的百度知道/result.txt", encoding="utf8", mode="r") as file_content:
	for line in file_content:
		count+=1
		print count
		try:
			js = json.loads(line.strip())
			if js['id'] not in id_set:
				file_writer.write(line)
				id_set.add(js['id'])
		except Exception, e:
			print e.message

file_writer.close()