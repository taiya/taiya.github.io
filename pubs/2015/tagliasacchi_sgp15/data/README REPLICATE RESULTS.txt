-------------------------------------------------------------------------------
Files used for paper figures and video sequences
-------------------------------------------------------------------------------

Note: most of these use the thumb's "twist" axis, which needs to be activated
      by uncommenting #define WITH_THUMB_TWIST on line 140 in Mapping.cpp

-------------------------------------------------------------------------------
    Paper
-------------------------------------------------------------------------------

Teaser:

    recs/maschroeteaser_6.dat
    tracks/maschroeteaser_6_raw.track
    tracks/maschroeteaser_6_cleaned.track

Figure 1:

    recs/intel_pose.dat
    recs/primesense_pose.dat

Figure 2:

    recs/maschroe_pcaweight.dat
    tracks/maschroe_pcaweight_off.track

Figure 3:

    N/A

Figure 4:

    recs/maschroe_pcaweight.dat

Figure 5:

    N/A

Figure 6:

    N/A

Figure 7:

    recs/maschroe_icp_5.dat
    tracks/maschroe_icp_5_depth_hack.track
    tracks/maschroe_icp_5_ours_z.track

Figure 8:

    recs/maschroe_push2.dat
    tracks/maschroe_push2_off.track
    tracks/maschroe_push2_on.track
    tracks/maschroe_push_off.track
    tracks/maschroe_push_on.track

Figure 9:

    N/A

Figure 10:

    N/A

Figure 11:

    recs/maschroe_pca_flex.dat
    tracks/maschroe_pca_flex_off.track
    tracks/maschroe_pca_flex_on.track

Figure 12:

    recs/maschroe_sequence_0.dat

Figure 13:

    recs/maschroe_pcaweight.dat
    tracks/maschroe_pcaweight_b4.track
    tracks/maschroe_pcaweight_b6.track
    tracks/maschroe_pcaweight_b9.track
    tracks/maschroe_pcaweight_off.track

Figure 14:

    recs/maschroe_limits_and_collisions.dat
    tracks/maschroe_limits_and_collisions_off.track
    tracks/maschroe_limits_and_collisions_on.track

Figure 15:

    recs/maschroe_fast_rigid_2.dat
    tracks/maschroe_fast_rigid_2_off.track
    tracks/maschroe_fast_rigid_2_on.track

Figure 16:

    recs/maschroe_jitter.dat
    tracks/maschroe_jitter_notemp.track
    tracks/maschroe_jitter_notemp_final.dat
    tracks/maschroe_jitter_yestemp_final.dat
    tracks/maschroe_jitter_yestemp_final2.track

Figure 17:

    recs/sridhar_*.dat
    recs/sridhar_*.txt
    tracks/sridhar_*.track

Figure 18:

    recs/maschroe_icp_8.dat
    tracks/maschroe_icp_8.track
    tracks/maschroe_icp_8_ours.track
    tracks/maschroe_icp_8_ours_video.track

Figure 19:

    recs/maschroemelax_3.bin
    tracks/maschroe_melax_3.track
    tracks/maschroe_melax_3e.track

    Note: requires left_hand=false in settings.ini

Figure 20:

    recs/maschroe_tompson.dat
    tracks/maschroe_tompson.track
    tracks/maschroe_tompson_video.track

Figure 21:

    recs/tompson.dat
    tracks/tompson_seq_2_truth.track
    tracks/tompson_seq_2_tompson.track
    tracks/tompson_seq_2_htrack.track
    tracks/tompson_cleaned.track

    Note: our results and Tompson's results use different focal length
          parameters; see #define FIX_CALIB_PARS on line 36 in Camera.cpp

Figure 22:

    recs/maschroe_fisting.dat
    tracks/maschroe_fisting.track

Figure 23:

    recs/maschroesmall_failure.dat
    tracks/maschroesmall_failure.track

Figure 24:

    N/A

-------------------------------------------------------------------------------
    Video
-------------------------------------------------------------------------------

Robust 3D Alignment:

    recs/maschroe_robust_intel.dat
    tracks/maschroe_robust_intel_no_reweight.track
    tracks/maschroe_robust_intel.track

    Note: uses maschroeintel.calib (or similar, not committed to SVN)

2D Alignment:

    recs/maschroe_2d3d.dat
    tracks/maschroe_2d3d_nopush.track
    tracks/maschroe_2d3d_yespush.track

Temporal Prior:

    recs/maschroe_jitter.dat
    tracks/maschroe_jitter_notemp.track
    tracks/maschroe_jitter_notemp_final.dat
    tracks/maschroe_jitter_yestemp_final.dat
    tracks/maschroe_jitter_yestemp_final2.track

Kinematic Prior:

    recs/maschroe_limits_and_collisions.dat
    tracks/maschroe_limits_and_collisions_off.track
    tracks/maschroe_limits_and_collisions_on.track

Data-Driven Prior:

    recs/maschroe_pcavid2.dat
    tracks/maschroe_pcavid2_energy.track

    Note: didn't save .track file for 2D subspace, but it's easy to reproduce

Rigid Motion:

    recs/maschroe_robust_rigid.dat
    tracks/maschroe_robust_rigid_1.track
    tracks/maschroe_robust_rigid_2.track

Two Hands Interaction:

    recs/maschroe_tompson.dat
    tracks/maschroe_tompson.track
    tracks/maschroe_tompson_video.track

Uncalibrated Model:

    recs/maschroesmall_failure.dat
    tracks/maschroesmall_failure.track

Fist Rotation:

    recs/maschroe_fisting.dat
    tracks/maschroe_fisting.track

Schroeder et al. 2014:

    recs/maschroe_icp_8.dat
    tracks/maschroe_icp_8.track
    tracks/maschroe_icp_8_ours.track
    tracks/maschroe_icp_8_ours_video.track

Tompson et al. 2014:

    recs/tompson.dat
    tracks/tompson_seq_2_truth.track
    tracks/tompson_seq_2_tompson.track
    tracks/tompson_seq_2_htrack.track
    tracks/tompson_cleaned.track

    Note: our results and Tompson's results use different focal length
          parameters; see #define FIX_CALIB_PARS on line 36 in Camera.cpp

Melax et al. 2013:

    recs/maschroemelax_3.bin
    tracks/maschroe_melax_3.track
    tracks/maschroe_melax_3e.track

    Note: requires left_hand=false in settings.ini

Animation:

    recs/maschroeteaser_6.dat
    tracks/maschroeteaser_6_raw.track
    tracks/maschroeteaser_6_cleaned.track

