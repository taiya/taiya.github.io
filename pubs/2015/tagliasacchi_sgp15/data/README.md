## HTrack - Comparison Dataset

Note that it is quite tricky to replicate these results, as the real-time source code is optimized for a Senz3D camera. In particular, the tracking failure detection will kick in erratically if not properly trained, and we only provide training for Senz3D in the code.

## FAQ

- Am I right in saying that you fitted the Tompson ground truth data with your own model to get the jpos_gtruth.txt file?

Correct.

- Did you also try estimating positions for (some subset of the) 36 ground truth position markers in the NYU dataset? Can you help me interpret the 24 positions in tompson_timeseries/jpos_*.txt… I see that the first coordinate is always (0, 0, 0), and that the next three 3D coordinates in each row are identical.

The easiest way is opening MATLAB and use the plotter in the .m script to see which is which. If I recall correctly there is one joint for base hand, 4x for each finger. But I’d have to inspect the data.
 
- So I think there are 21 unique positions... do they correspond to a wrist marker, and then 4 locations per digit (at joints and fingertips)?

Yah, as said above.

- Then by running the script sridhar_comparison/runme.m for the different Sridhar sequences. Comparing with Fig. 17 from your paper, it looks to me like the trailing underscore means “without re-initialization” (red bars).

Yes the underscores differentiates with/without reinit.

- In Fig. 17 it looks like “pinch” has the lowest error, whereas below it’s "flexex1". Or the red bar shown in Fig. 17 for the "fingerwave" sequence is ~16mm (certainly more than 15mm), whereas below it’s even better at 12.3mm. Can you help me match these up? 

Note there are some commented lines in the script. It’s possible I was simply not using the right option (initially I was manually checking when there were incorrectly placed markers and setting the threshold for rejecting them on a case-per-case). In any case, the comparison without re-init doesn’t have much importance (looks pretty terrible if you look closely).

- I assume I’m right in saying that we should simply compare to all your results without underscores, as these seem to be your best results on each sequence?

Yes, those are the ones with re-initialization (reinit was necessary in this comparison as this dataset is recorded at a low frame rate). You should use those numbers if you just want 1 bar for our method.