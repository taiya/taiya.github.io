# --- Converts the publications into a bibtex file for use in latex
import json

# @article{flowcaps,
#   title={Unsupervised part representation by Flow Capsules},
#   author={Sara Sabour and \textbf{Andrea Tagliasacchi} and Soroosh Yazdani and Geoffrey E. Hinton and David J. Fleet},
#   year={2021},
#   journal=ICML,
#   note={\url{https://arxiv.org/abs/2011.13920}}
# }

_conference_template="""
@conference{KEY,
   title={{TITLE}},
   author={AUTHORS},
   howpublished={{CONFERENCE}},
   year={YEAR},
   notes={NOTES},
}"""

_journal_template="""
@article{KEY,
   title={{TITLE}},
   author={AUTHORS},
   journal={{CONFERENCE}},
   year={YEAR},
   notes={NOTES},
}"""

_techreport_template="""
@techreport{KEY,
   title={{TITLE}},
   author={AUTHORS},
   institution={{INSTITUTION}},
   year={YEAR},
   notes={NOTES},
}"""

_workshop_template="""
@techreport{KEY,
   title={{TITLE}},
   author={AUTHORS},
   institution={{INSTITUTION}},
   year={YEAR},
   notes={NOTES},
}"""

_course_template="""
@misc{KEY,
   title={{TITLE}},
   author={AUTHORS},
   howpublished={{HOWPUBLISHED}},
   year={YEAR},
   notes={NOTES},
}"""

def list_to_string(mylist):
    return " and ".join(mylist)

def notes_to_string(mylist):
    ret = ", ".join(mylist)
    ret = f"({ret})"
    return ret

def conference(pub):
    ret = _conference_template
    ret = ret.replace("KEY", pub['key'])
    ret = ret.replace("TITLE", pub['title'])
    ret = ret.replace("AUTHORS", list_to_string(pub['authors']))
    ret = ret.replace("CONFERENCE", pub['venue'])
    ret = ret.replace("YEAR", pub['year'])
    ret = ret.replace("NOTES", notes_to_string(pub['notes']) if "notes" in pub  else "")
    return ret

def journal(pub):
    ret = _journal_template
    ret = ret.replace("KEY", pub['key'])
    ret = ret.replace("TITLE", pub['title'])
    ret = ret.replace("AUTHORS", list_to_string(pub['authors']))
    ret = ret.replace("CONFERENCE", pub['venue'])
    ret = ret.replace("YEAR", pub['year'])
    ret = ret.replace("NOTES", notes_to_string(pub['notes']) if "notes" in pub  else "")
    return ret

def techreport(pub):
    ret = _techreport_template
    ret = ret.replace("KEY", pub['key'])
    ret = ret.replace("TITLE", pub['title'])
    ret = ret.replace("AUTHORS", list_to_string(pub['authors']))
    ret = ret.replace("CONFERENCE", pub['venue'])
    ret = ret.replace("YEAR", pub['year'])
    ret = ret.replace("NOTES", notes_to_string(pub['notes']) if "notes" in pub  else "")
    return ret

def misc(pub):
    ret = _course_template
    ret = ret.replace("KEY", pub['key'])
    ret = ret.replace("TITLE", pub['title'])
    ret = ret.replace("AUTHORS", list_to_string(pub['authors']))
    ret = ret.replace("HOWPUBLISHED", pub['venue'])
    ret = ret.replace("YEAR", pub['year'])
    ret = ret.replace("NOTES", notes_to_string(pub['notes']) if "notes" in pub  else "")
    return ret

def dispatcher(pub):
    if pub['type'] == 'conference': return conference(pub)
    if pub['type'] == 'journal': return journal(pub)
    if pub['type'] == 'techreport': return techreport(pub)
    if pub['type'] == 'course': return techreport(pub)
    raise ValueError(pub['type'])

with open('pubs.json', 'r') as fp:
    data = json.load(fp)
    for pub in data:
        # if pub['key'] != "chen2020bspnet": continue #TODO
        # if "notes" not in pub: continue
        print(dispatcher(pub))
