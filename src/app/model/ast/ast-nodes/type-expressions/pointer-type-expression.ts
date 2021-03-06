import { TypeEnvironment } from "src/app/model/typing/type-environment";
import { AstNode } from "../../ast-node";
import { Graph, Edge } from 'src/app/model/common/graph/_module';
import { AbstractTypeExpression } from "./abstract-type-expression";
import { BaseTypeExpression } from "./base-type-expression";

import { PointerType as PointerType_ } from "src/app/model/typing/types/type-constructors/pointer-type";
import { AbstractType as AbstractType_ } from "src/app/model/typing/types/abstract-type";
import { TypingTree } from "src/app/model/typing/typing-tree/typing-tree";
import { TypingTreeNodeLabel } from "src/app/model/typing/typing-tree/typing-tree-node-label";

// char*, int[]
export class PointerTypeExpression extends AbstractTypeExpression {

    public target: BaseTypeExpression;

    constructor(codeLine: number, target: BaseTypeExpression) {
        super(codeLine);
        this.target = target;
    }

    public getCode(): string {
        return this.target.getCode() + "*";
    }

    public getGraphNodeLabel(): string {
        return "*";
    }

    public getGraph(): Graph<AstNode> {
        let graph = this.target.getGraph();

        let newNode = this.getGraphNode();
        let newEdge = new Edge(newNode, this.target.getGraphNode());
        
        return new Graph([newNode], [newEdge]).merge(graph);
    }

    public performTypeCheck(t: TypeEnvironment): AbstractType_ {
        const targetType: AbstractType_ = this.target.performTypeCheck(t);
        return this.type = new PointerType_(targetType);;
    }

    public getType(): AbstractType_ {
        return this.type;
    }

    public getTypingTree(): TypingTree {
        throw new Error("Method not implemented.");
    }
}