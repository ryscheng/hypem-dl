#!/usr/bin/python
# -*- coding: utf-8 -*-
import sys
import string
import os

mediadir = "/media/Music/MusicVideo/"

def getArtistsFromDirectory(directory):
  result = set([])
  #print directory
  for path, subdirs, files in os.walk(directory):
    for filename in files:
      #print filename
      artist = getArtistFromFile(filename)
      if artist is not None:
        result.add(artist)
    for subdir in subdirs:
      #print subdir
      result = result.union(getArtistsFromDirectory(subdir))
  return result

def getArtistFromFile(filename): 
  i = string.find(filename, " - ")
  if i > -1:
    return filename[:i].strip()
  else:
    return None

if __name__ == '__main__':
  argc = 0
  artists = getArtistsFromDirectory(mediadir)
  print artists

  if len(sys.argv) < 2:
    print "python underscore-to-space.py [FILES]"
  
  for arg in sys.argv:
    if argc > 0:
      newname = string.replace(arg, "_", " ")
      newname = string.replace(newname, "► ", "")
      newname = string.replace(newname, "feat", "ft")
      newname = string.replace(newname, " hd1080", "")
      newname = string.replace(newname, " The Hype Machine","Hype Machine")
      newname = string.replace(newname, " OFFICIAL VIDEO", "")
      newname = string.replace(newname, " Official Video", "")
      newname = string.replace(newname, " OFFICIAL MUSIC VIDEO", "")
      newname = string.replace(newname, " Official Music Video", "")
      newname = string.replace(newname, " Music Video", "")
      newname = string.replace(newname, " MUSIC VIDEO", "")
      newname = string.replace(newname, " hd720", "")
      newname = string.replace(newname, ".128.mp3", ".mp3")

      # Remove everything after "Hype Machine"
      start = string.find(newname, " Hype Machine", 0)
      end = string.find(newname, ".mp3")
      if start > 0 and end > 0:
        newname = newname[:start] + ".mp3"

      # Add a dash for known artists
      start = 0
      i = string.find(newname, " ", start)
      while i > -1:
        if newname[:i] in artists and not newname[:(i+2)] == (newname[:i]+" -"):
          newname = newname[:i] + " - " + newname[(i+1):]
        start = i+1
        i = string.find(newname, " ", start)
      print arg + "=>" + newname
      os.rename(arg, newname)
    argc+=1
  print argc
