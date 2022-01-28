#!/bin/python3
import os
import argparse

SIGN = [b'\x46\x57\x53', b'\x43\x57\x53']
RES_EXT = ".swf"


def get_safety_file_name(name):
    n = 0
    candidate = name
    base_ext = os.path.splitext(name)
    while True:
        if not os.path.isfile(candidate):
            return candidate
        else:
            n += 1
            candidate = "{0}({1}){2}".format(base_ext[0], n, base_ext[1])


def write_to_file(src, dst, offset, size):
    src.seek(offset)
    buf = src.read(size)
    dst.write(buf)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--Input", type=str, required=True, help="Input file")
    parser.add_argument("-tar", "--Target", type=str, choices=["all", "bigger", "ordinal"], default="bigger")
    parser.add_argument("-ord", "--Ordinal", type=int, default=0)
    args = parser.parse_args()

    targets = []
    fname = args.Input
    with open(fname, "rb") as f:
        f.seek(0, os.SEEK_END)
        file_size = f.tell()
        f.seek(0)

        first_bytes = [x[0:1] for x in SIGN]
        last_bytes = [x[1:] for x in SIGN]

        while b := f.read(1):
            if b in first_bytes:
                last_pos = f.tell()

                if f.read(2) in last_bytes \
                        and 0 < int.from_bytes(f.read(1), "little", signed=False) <= 44 \
                        and 0 < (size_i := int.from_bytes(f.read(4), "little", signed=False)):
                    targets.append([last_pos - 1, size_i])
                    f.seek(last_pos - 1 + size_i)
                    continue

                f.seek(last_pos)

        print("Find: {0} files.\n{1}".format(targ_len := len(targets), targets))
        if targ_len == 0:
            exit(0)

        split_fname = os.path.splitext(fname)
        if args.Target == "all":
            for i in range(targ_len):
                res_fname = get_safety_file_name("{0}_{1}{2}".format(split_fname[0], i, RES_EXT))
                with open(res_fname, "wb") as res_f:
                    write_to_file(f, res_f, targets[i][0], targets[i][1])

        elif args.Target == "bigger":
            targ = max(targets, key=lambda a: a[1])
            res_fname = get_safety_file_name("{0}{1}".format(split_fname[0], RES_EXT))
            with open(res_fname, "wb") as res_f:
                write_to_file(f, res_f, targ[0], targ[1])
        else:
            n = int(args.Ordinal)
            if 0 <= n < targ_len:
                res_fname = get_safety_file_name("{0}_{1}{2}".format(split_fname[0], n, RES_EXT))
                with open(res_fname, "wb") as res_f:
                    write_to_file(f, res_f, targets[n][0], targets[n][1])
            else:
                print("Invalid ordinal! Range from 0 to {}".format(targ_len - 1))

    exit(0)
