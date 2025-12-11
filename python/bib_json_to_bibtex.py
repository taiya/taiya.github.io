# --- Converts the publications into a bibtex file for use in latex
import json

_conference_template="""
@inproceedings{KEY,
   title={{TITLE}},
   author={AUTHORS},
   booktitle={{CONFERENCE}},
   year={YEAR},
   note={\\textbf{NOTES}},
}"""

_journal_template="""
@article{KEY,
   title={{TITLE}},
   author={AUTHORS},
   journal={{CONFERENCE}},
   year={YEAR},
   note={\\textbf{NOTES}},
}"""

_techreport_template="""
@techreport{KEY,
   title={{TITLE}},
   author={AUTHORS},
   institution={{INSTITUTION}},
   year={YEAR},
   note={\\textbf{NOTES}},
}"""

_arxiv_template="""
@misc{KEY,
   title={\\normalfont{``TITLE''}},
   author={AUTHORS},
   year={YEAR},
   venue={arXiv preprint},
   url={URL},
}"""

_patent_template="""
@patent{KEY,
   title={TITLE},
   author={AUTHORS},
   number={NUMBER},
   year={YEAR},
   note={NOTES},
}"""

_workshop_template="""
@techreport{KEY,
   title={{TITLE}},
   author={AUTHORS},
   institution={{INSTITUTION}},
   year={YEAR},
   note={\\textbf{NOTES}},
}"""

_course_template="""
@course{KEY,
   title={{TITLE}},
   author={AUTHORS},
   howpublished={{HOWPUBLISHED}},
   year={YEAR},
   note={\\textbf{NOTES}},
}"""

def list_to_string(mylist):
    highlight_names = [
        "Aryan Mikaeili",
        "Anastasia Tkach",
        "Weiwei Sun",
        "Daniel Rebain",
        "Sara Sabour",
        "Shrisudhan Govindarajan",
        "Ahan Shabanov",
        "Maria Taktasheva",
        "Yalda Foroutan",
        "Zhen (Colin) Li",
        "Shakiba Kheradmand",
        "Lily Goli",
        "Sherwin Bahmani",
        "Baptiste Angles",
        "Abhishek Kumar Bojja",
        "Boyang Deng",
        "Gopal Sharma",
        # interns?
        "Francis Williams",
        "Zhiqin Chen",
        "Kacper Kania",
        "Timothy Jeruzalski",
        "Cody Reading",
        "Zeno Sambugaro",
        "Alessandro Fiorini"
    ]
    for name in highlight_names:
        # --- underlined independently
        first = name.split()[0]
        last = name.split()[1]
        ulinename = f"\\ul{{{first}}} \\ul{{{last}}}"
        mylist = [author.replace(name, ulinename) for author in mylist]
        # --- underlined as a whole
        # mylist = [author.replace(name, f"\\ul{{{name}}}") for author in mylist]
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

def arxiv(pub):
    ret = _arxiv_template
    ret = ret.replace("KEY", pub['key'])
    ret = ret.replace("TITLE", pub['title'])
    ret = ret.replace("AUTHORS", list_to_string(pub['authors']))
    ret = ret.replace("YEAR", pub['year'])
    if 'arxiv' in pub:
        ret = ret.replace("URL", pub['arxiv'])
    else:
        ret = ret.replace("URL", "")
    ret = ret.replace("NOTES", notes_to_string(pub['notes']) if "notes" in pub  else "")
    return ret

def patent(pub):
    ret = _patent_template
    ret = ret.replace("KEY", pub['key'])
    ret = ret.replace("TITLE", pub['title'])
    ret = ret.replace("AUTHORS", list_to_string(pub['authors']))
    ret = ret.replace("YEAR", pub['year'])
    ret = ret.replace("NUMBER", pub['number'])
    ret = ret.replace("NOTES", f"Filed: {pub['filed']}")
    return ret

def course(pub):
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
    if pub['type'] == 'course': return course(pub)
    if pub['type'] == 'arxiv': return arxiv(pub)
    if pub['type'] == 'patent': return patent(pub)
    raise ValueError(pub['type'])

with open('../pubs.json', 'r') as fp:
    data = json.load(fp)
    for pub in data:
        # if pub['key'] != "chen2020bspnet": continue #TODO
        text = dispatcher(pub)
        # text = text.replace("Andrea Tagliasacchi", "\\textcolor{BrickRed}{Andrea Tagliasacchi}")
        text = text.replace("Andrea Tagliasacchi", "\\textbf{Andrea} \\textbf{Tagliasacchi}")
        print(text)
