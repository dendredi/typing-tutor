import { TypeEnvironment } from "src/app/model/typing/type-environment";
import { AstNode, NodeType } from "../../abstract-syntax-tree";
import { Graph } from "../../graph";
import { AbstractType } from "./abstract-type";

import { StructType as StructType_ } from "src/app/model/typing/types/type-constructors/struct-type";
import { AbstractType as AbstractType_ } from "src/app/model/typing/types/abstract-type";

export class StructType extends AbstractType {

    protected nodeType: NodeType = NodeType.StructType;
    public name: string;

    private type: AbstractType_ = null;

    constructor(codeLine: number, name: string) {
        super(codeLine);
        this.name = name;
    }

    public getGraph(): Graph<AstNode> {
        return new Graph([this.getGraphNode()], [])
    }

    // @Override
    public getGraphNodeLabel(): string {
        return this.nodeType + " " + this.name;
    }

    public performTypeCheck(t: TypeEnvironment): AbstractType_ {
        return this.type = t.getTypeOfIdentifier(this.name);
    }

    public getType(): AbstractType_ {
        return this.type;
    }
}