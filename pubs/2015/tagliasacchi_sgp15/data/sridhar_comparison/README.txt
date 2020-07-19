Annotation Details
======================

This directory contains 3 files (excluding this).

------------------------------
1. Pos2D.txt
------------------------------
Sequence of 6-line blocks separated by two newlines. Each block is one
data frame. The lines in the block are the 2D position (x, y) of fingertips
on the image. The order of the points within each block is as follows.

1. Thumb_x, Thumb_y
2. Fore_x, Fore_y
3. Middle_x, Middle_y
4. Ring_x, Ring_y
5. Little_x, Little_y
6. PalmCenter_x, PalmCenter_y

The annotater was instructed to select a background pixel for points
that are not visible. These get a value of 3.2001e+007 in 3D.


------------------------------
2. Pos3D.txt
------------------------------
Exactly the same as above but these are the 3D positions (x,y,z) of
the 2D points. The unprojection was done using ToF camera intrinsics
information.

Invalid points are located in the background. These get a value of
3.2001e+007 in 3D.


------------------------------
3. SEQUENCE_NAME_anno.avi
------------------------------
Annotations overlaid on ToF data. Points in background (i.e. not in
the hand) are invalid points.
