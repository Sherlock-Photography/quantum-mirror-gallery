SOURCE_IMAGES=$(wildcard images/*.jpg)

all: index.html

index.html : index.js index-head.html index-foot.html $(SOURCE_IMAGES)
	node index | cat index-head.html - index-foot.html > index.html

%.jpg : %.png
	convert $< $<.ppm
	cjpeg -optimize -quality 85 $<.ppm > $@
	rm $<.ppm

clean:
	rm -f index.html images/*.ppm
