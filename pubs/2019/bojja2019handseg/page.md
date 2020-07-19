# HandSeg: An Automatically Labeled Dataset for Hand Segmentation from Depth Image

 
 - Abhishake Kumar Bojja <sup>1</sup>, Franziska Mueller <sup>2</sup>, Sri Raghu Malireddi <sup>1</sup>, Markus Oberweger <sup>3</sup>, Vincent Lepetit <sup>3</sup>, Christian Theobalt <sup>2</sup>, Kwang Moo Yi <sup>1</sup>, Andrea Tagliasacchi <sup>1</sup>

   - <sup>1</sup> University of Victoria, <sup>2</sup> MPI Informatics, <sup>3</sup> TU Graz
   - {abojja, raghu, kyi, ataiya}@uvic.ca, {frmueller, theobalt}@mpi-inf.mpg.de, {oberweger, lepetit}@icg.tugraz.at

<img src="/pubs/2019/bojja2019handseg/teaser.jpg" alt="Teaser image" width="100%"/>

**Abstract.** We propose an automatic method for generating high-quality annotations for depth-based hand segmentation, and introduce a large- scale hand segmentation dataset. Existing datasets are typically limited to a single hand. By exploiting the visual cues given by an RGBD sensor and a pair of colored gloves, we automatically generate dense annotations for two hand segmentation. This lowers the cost/complexity of creating high quality datasets, and makes it easy to expand the dataset in the future. We further show that existing datasets, even with data augmentation, are not sufficient to train a hand segmentation algorithm that can distinguish two hands. Source and datasets will be made publicly available.

* Reference: [Bojja et. al, "HandSeg: An Automatically Labeled Dataset for Hand Segmentation from Depth Image", arXiv, 2017](https://arxiv.org/abs/1711.05944)

* Download link for the dataset: [handseg-150k-20180914.zip (11GB)](http://webhome.cs.uvic.ca/~kyi/files/2018/handseg/handseg-150k-20180914.zip)

* GitHub link for the code: [Coming soon]

## The HandSeg Dataset

The dataset comprises of 158,000 depth images captured with a RealSense SR300 camera and automatically annotated labels. The dataset contains 7 male and 3 female subjects. After the automatic labeling is done, the labels were carefully inspected to have no labeling errors. For more details, please see to the paper.

Note: An updated version of the dataset will be released soon with more images.

### Dataset instructions

The dataset archive consists of images, masks folders

- **images**:
This folder consists of the *depth images*, where each image is of size (640 × 480) and is formatted as **`user-<s>.<f>.png`**, where `<s>` is the subject number and `<f>` is the frame number.

- **masks**:
This folder consists of the *segmentation masks*, where each image is of size (640 × 480) and is formatted as **`user-<s>.<f>.png`**, where `<s>` is the subject number and `<f>` is the frame number. The labels for the segmentation are: **Label 0**: Background, **Label 1**: Right Hand, **Label 2**: Left Hand.

- Code snippet for loading and displaying images  
   ```css

  from PIL import Image
  from matplotlib import pyplot as plt

  depth_im = np.array(Image.open('data/images/user-4.00000003.png'))# Loading depth image
  mask_im = np.array(Image.open('data/masks/user-4.00000003.png'))#  Loading mask image
  depth_im = depth_im.astype(np.float32)# Converting to float
  mean_depth_ims = 10000.0 # Mean value of the depth images
  depth_im /= mean_depth_ims # Normalizing depth image
  plt.imshow(depth_im); plt.title('Depth Image'); plt.show() # Displaying Depth Image
  plt.imshow(mask_im); plt.title('Mask Image'); plt.show() # Displaying Mask Image

  ```

