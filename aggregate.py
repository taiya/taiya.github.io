import shutil
from pathlib import Path
from PIL import Image

# --- aggregate all icons in a single folder (to be action deployed)
paths = [path for path in Path("pubs").iterdir()]
for path in paths:
  for ext in ["png", "jpg", "jpeg"]:
    path_w_ext = Path(path / f"icon.{ext}")
    if path_w_ext.is_file():
      target = f"temp/{path_w_ext.parent.name}.{ext}"
      print(f"moving: {path_w_ext} -> {target}")
      shutil.move(path_w_ext, target)

# --- convert all to jpg
for path in Path("temp/").iterdir():
  im = Image.open(path)
  rgb = im.convert("RGB")
  target = "src/icons/" + path.stem + ".jpg"
  print(f"converted: {path} -> {target}")
  rgb.save(target)

# --- aggregate all icons in a single folder (to be action deployed)
for path in Path("pubs").iterdir():
  pdfpath = Path(path / f"paper.pdf")
  if pdfpath.is_file():
    target = f"pubs/{pdfpath.parent.name}.pdf"
    print(f"moved: {pdfpath} -> {target}")
    shutil.move(pdfpath, target)

# auto delete if job done
for path in Path("pubs").iterdir():
  children = [x for x in path.iterdir()]
  if len(children) == 0:
    print(f"deleting: {path}")
    # shutil.rmtree(path)